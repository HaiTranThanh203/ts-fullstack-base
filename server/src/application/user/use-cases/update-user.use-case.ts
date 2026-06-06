import { Inject, Injectable } from '@nestjs/common';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import {
  UserNotFoundException,
  UserAlreadyExistsException,
} from '../../domain/exceptions/user.exception';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    // Nếu đổi email thì kiểm tra email mới chưa bị dùng
    if (dto.email && dto.email !== user.email) {
      const exists = await this.userRepository.existsByEmail(dto.email);
      if (exists) {
        throw new UserAlreadyExistsException(dto.email);
      }
    }

    const updated = await this.userRepository.update(id, dto);
    if (!updated) {
      throw new UserNotFoundException(id);
    }

    return UserMapper.toResponse(updated);
  }
}