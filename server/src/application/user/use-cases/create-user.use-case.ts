import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from '../dtos/create-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';
import { type IUserRepository, USER_REPOSITORY } from '@/domain/repositories/user.repository.interface';
import { UserAlreadyExistsException } from '@/domain/exceptions/user.exception';
import { UserRole } from '@/domain/entities/user.entity';


@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    const exists = await this.userRepository.existsByEmail(dto.email);
    if (exists) {
      throw new UserAlreadyExistsException(dto.email);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role ?? UserRole.USER,
    });

    return UserMapper.toResponse(user);
  }
}