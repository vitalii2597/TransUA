import { Controller, Get, Patch, Delete, Body, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@SkipThrottle()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: { id: string }) {
    return this.usersService.getMe(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: { id: string }, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(user.id, dto);
  }

  @Delete('me')
  deleteMe(@CurrentUser() user: { id: string }) {
    return this.usersService.deleteMe(user.id);
  }
}
