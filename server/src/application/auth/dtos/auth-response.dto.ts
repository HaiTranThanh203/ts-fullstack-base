import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dtos/user-response.dto';

export class TokenPairDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'a1b2c3d4e5f6...' })
  refreshToken!: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'a1b2c3d4e5f6...' })
  refreshToken!: string;
}