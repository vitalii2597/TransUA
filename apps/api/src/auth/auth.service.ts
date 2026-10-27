import { Injectable, ConflictException, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const LOCALES = ['uk', 'no', 'sv', 'pl'];

// Refresh tokens are high-entropy signed JWTs, not user-chosen secrets, so a fast
// hash is the right tool here (unlike passwords, which need bcrypt's deliberate
// slowness against brute force). Hashing means a leaked DB alone can't be replayed
// as a session the way a plaintext token could.
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException({ code: 'EMAIL_TAKEN', message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        passwordHash,
        preferredLang: dto.preferredLang || 'uk',
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash: _, ...userSafe } = user;
    return { data: { user: userSafe, ...tokens }, error: null };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    const valid = user && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!valid) {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash: _, ...userSafe } = user;
    return { data: { user: userSafe, ...tokens }, error: null };
  }

  async refresh(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException({ code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' });
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    const tokens = await this.generateTokens(stored.user.id, stored.user.email, stored.user.role);
    await this.saveRefreshToken(stored.user.id, tokens.refreshToken);

    return { data: tokens, error: null };
  }

  // Always answers the same way whether or not the email exists, so this endpoint
  // can't be used to discover which addresses have accounts. All the work (lookup,
  // token write, email) runs after responding for the same reason — otherwise the
  // extra DB round-trips for real accounts would show up in response time.
  async forgotPassword(dto: ForgotPasswordDto) {
    this.issueResetLink(dto).catch((err) => this.logger.error(`Password reset failed: ${err}`));
    return { data: { sent: true }, error: null };
  }

  private async issueResetLink(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) return;

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await this.prisma.$transaction([
      this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
      this.prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt } }),
    ]);

    // preferredLang predates locale validation, so guard against values the web app has no route for.
    const lang = dto.locale || (LOCALES.includes(user.preferredLang) ? user.preferredLang : 'uk');
    const frontend = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
    const link = `${frontend}/${lang}/reset-password?token=${token}`;
    await this.mail.sendPasswordReset(user.email, link, lang);
  }

  async resetPassword(dto: ResetPasswordDto) {
    const stored = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(dto.token) },
    });
    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      throw new BadRequestException({ code: 'INVALID_RESET_TOKEN', message: 'Reset link is invalid or has expired' });
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.prisma.$transaction(async (tx) => {
      // Conditional claim guards against two concurrent submits of the same link.
      const claimed = await tx.passwordResetToken.updateMany({
        where: { id: stored.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      if (claimed.count === 0) {
        throw new BadRequestException({ code: 'INVALID_RESET_TOKEN', message: 'Reset link is invalid or has expired' });
      }
      await tx.user.update({ where: { id: stored.userId }, data: { passwordHash } });
      // Whoever knew the old password may hold live sessions — end them all.
      await tx.refreshToken.deleteMany({ where: { userId: stored.userId } });
    });

    return { data: { success: true }, error: null };
  }

  async logout(userId: string, token: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId, tokenHash: hashToken(token) } });
    return { data: { success: true }, error: null };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN') || '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.refreshToken.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
  }
}
