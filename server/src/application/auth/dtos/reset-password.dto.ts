import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123def456...', description: 'Password reset token from email' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: 'NewPassword123!', minLength: 8, description: 'New password (min 8 characters)' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
