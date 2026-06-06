import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../domain/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateUserDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  name!: string;      // Dùng ! vì bắt buộc phải có

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;     // Dùng ! vì bắt buộc phải có

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;  // Dùng ! vì bắt buộc phải có

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.USER; // Dùng ? vì không bắt buộc
}