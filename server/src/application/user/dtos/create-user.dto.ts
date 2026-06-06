import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../domain/entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;      // Dùng ! vì bắt buộc phải có

  @IsEmail()
  @IsNotEmpty()
  email!: string;     // Dùng ! vì bắt buộc phải có

  @IsString()
  @MinLength(8)
  password!: string;  // Dùng ! vì bắt buộc phải có

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.USER; // Dùng ? vì không bắt buộc
}