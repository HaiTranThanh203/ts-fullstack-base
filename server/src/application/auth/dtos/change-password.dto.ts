import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentPassword123!', description: 'Current password' })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({ example: 'NewPassword123!', minLength: 8, description: 'New password (min 8 characters)' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
