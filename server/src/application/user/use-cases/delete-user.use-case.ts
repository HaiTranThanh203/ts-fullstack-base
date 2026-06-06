import { UserDeletedException, UserNotFoundException } from '@/domain/exceptions/user.exception';
import { type IUserRepository, USER_REPOSITORY } from '@/domain/repositories/user.repository.interface';
import { Inject, Injectable } from '@nestjs/common';


@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    if (user.isDeleted()) {
      throw new UserDeletedException(id);
    }

    await this.userRepository.softDelete(id);
  }
}