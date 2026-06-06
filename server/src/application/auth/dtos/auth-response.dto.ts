import { UserResponseDto } from "@/application/user/dtos/user-response.dto";


export class TokenPairDto {
  accessToken!: string;
  refreshToken!: string;
}

export class AuthResponseDto {
  user!: UserResponseDto;
  accessToken!: string;
  refreshToken!: string;
}