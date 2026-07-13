import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchemaClass, UserSchema } from './database/schemas/user.schema';
import { UserRepositoryImpl } from './repositories/user.repository.impl';
import { USER_REPOSITORY } from '../domain/repositories/user.repository.interface';
import { RefreshTokenSchema, RefreshTokenSchemaClass } from './database/schemas/refresh-token.schema';
import { REFRESH_TOKEN_REPOSITORY } from '@/domain/repositories/refresh-token.repository.interface';
import { RefreshTokenRepositoryImpl } from './repositories/refresh-token.repository.impl';
import { PasswordResetTokenSchema, PasswordResetTokenSchemaClass } from './database/schemas/password-reset-token.schema';
import { PASSWORD_RESET_TOKEN_REPOSITORY } from '@/domain/repositories/password-reset-token.repository.interface';
import { PasswordResetTokenRepositoryImpl } from './repositories/password-reset-token.repository.impl';
import { EmailService } from './services/email.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserSchemaClass.name, schema: UserSchema },
      { name: RefreshTokenSchemaClass.name, schema: RefreshTokenSchema },
      { name: PasswordResetTokenSchemaClass.name, schema: PasswordResetTokenSchema },
    ]),
  ],
  providers: [
    // Bind Symbol token → implementation cụ thể
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
     { provide: REFRESH_TOKEN_REPOSITORY, useClass: RefreshTokenRepositoryImpl },
     { provide: PASSWORD_RESET_TOKEN_REPOSITORY, useClass: PasswordResetTokenRepositoryImpl },
     EmailService,
  ],
  exports: [USER_REPOSITORY, REFRESH_TOKEN_REPOSITORY, PASSWORD_RESET_TOKEN_REPOSITORY, EmailService],
})
export class InfrastructureModule {}