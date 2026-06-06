import { IsEmail, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Nguyen Van B' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'new@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;
}