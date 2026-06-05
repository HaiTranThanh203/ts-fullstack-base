import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchemaClass, UserSchema } from './database/schemas/user.schema';
import { UserRepositoryImpl } from './repositories/user.repository.impl';
import { USER_REPOSITORY } from '../domain/repositories/user.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserSchemaClass.name, schema: UserSchema },
    ]),
  ],
  providers: [
    // Bind Symbol token → implementation cụ thể
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [USER_REPOSITORY],  // export để UsersModule dùng được
})
export class InfrastructureModule {}