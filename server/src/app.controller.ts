// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validate } from './shared/config/env.validation';

@Module({
  imports: [
    // Load .env toàn cục, validate ngay khi khởi động
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),

    // Kết nối MongoDB async, đợi ConfigService sẵn sàng
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
        // Mongoose 7+ không cần useNewUrlParser / useUnifiedTopology nữa
      }),
    }),
  ],
})
export class AppModule {}