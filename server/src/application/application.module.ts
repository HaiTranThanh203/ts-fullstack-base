import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { CreateUserUseCase } from './user/use-cases/create-user.use-case';
import { FindUserByIdUseCase } from './user/use-cases/find-user-by-id.use-case';
import { UpdateUserUseCase } from './user/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './user/use-cases/delete-user.use-case';
import { LogoutUseCase } from './auth/use-cases/logout.use-case';
import { RefreshTokenUseCase } from './auth/use-cases/refresh-token.use-case';
import { LoginUseCase } from './auth/use-cases/login.use-case';
import { FindAllUsersUseCase } from './user/use-cases/find-all-users.use-case';
import { RegisterUseCase } from './auth/use-cases/register.use-case';
import { ForgotPasswordUseCase } from './auth/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './auth/use-cases/reset-password.use-case';
import { ChangePasswordUseCase } from './auth/use-cases/change-password.use-case';


const USER_USE_CASES  = [
  CreateUserUseCase,
  FindAllUsersUseCase,
  FindUserByIdUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
];

const AUTH_USE_CASES = [
  LoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  RegisterUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
  ChangePasswordUseCase,
];

@Module({
  imports: [
    InfrastructureModule,
     JwtModule.register({}),
  
  ],
   providers: [...USER_USE_CASES, ...AUTH_USE_CASES],
  exports: [...USER_USE_CASES, ...AUTH_USE_CASES, JwtModule],
})
export class ApplicationModule {}