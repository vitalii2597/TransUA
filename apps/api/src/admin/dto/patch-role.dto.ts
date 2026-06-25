import { IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class PatchRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}
