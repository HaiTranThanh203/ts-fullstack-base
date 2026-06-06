
import { User } from '@/domain/entities/user.entity';
import { UserResponseDto } from '../dtos/user-response.dto';

export class UserMapper {
  static toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toResponseList(users: User[]): UserResponseDto[] {
    return users.map(UserMapper.toResponse);
  }
}