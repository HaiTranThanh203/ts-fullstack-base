import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchemaClass, UserSchema } from './database/schemas/user.schema';
import { UserRepositoryImpl } from './repositories/user.repository.impl';
import { USER_REPOSITORY } from '../domain/repositories/user.repository.interface';
import { RefreshTokenSchema, RefreshTokenSchemaClass } from './database/schemas/refresh-token.schema';
import { REFRESH_TOKEN_REPOSITORY } from '@/domain/repositories/refresh-token.repository.interface';
import { RefreshTokenRepositoryImpl } from './repositories/refresh-token.repository.impl';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserSchemaClass.name, schema: UserSchema },
      { name: RefreshTokenSchemaClass.name, schema: RefreshTokenSchema },
    ]),
  ],
  providers: [
    // Bind Symbol token → implementation cụ thể
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
     { provide: REFRESH_TOKEN_REPOSITORY, useClass: RefreshTokenRepositoryImpl },
  ],
  exports: [USER_REPOSITORY,REFRESH_TOKEN_REPOSITORY],  // export để UsersModule dùng được
})
export class InfrastructureModule {}