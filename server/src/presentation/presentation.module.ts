import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { UserController } from './controllers/user.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { InfrastructureModule } from '@/infrastructure/infrastructure.module';
import { AuthController } from './controllers/auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
@Module({
  imports: [
    ApplicationModule,
    InfrastructureModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [UserController, AuthController],
  providers: [
    JwtStrategy,
    // Đăng ký global — mọi route đều cần JWT trừ @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class PresentationModule {}