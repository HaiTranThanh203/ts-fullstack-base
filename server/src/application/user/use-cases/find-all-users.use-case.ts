import { Inject, Injectable } from '@nestjs/common';
import {
 type IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { QueryUserDto } from '../dtos/query-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';

export interface FindAllUsersResult {
  data: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class FindAllUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: QueryUserDto): Promise<FindAllUsersResult> {
    const { page = 1, limit = 10, role } = query;

    const result = await this.userRepository.findAll({ page, limit, role });

    return {
      data: UserMapper.toResponseList(result.data),
      total: result.total,
      page,
      limit,
    };
  }
}