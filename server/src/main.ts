import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Lấy ConfigService từ NestJS
import { AppModule } from './app.module';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { DomainExceptionFilter } from './shared/filters/domain-exception.filter';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Thứ tự filter quan trọng — filter đăng ký sau được ưu tiên trước
  // DomainExceptionFilter xử lý trước, HttpExceptionFilter xử lý sau
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new DomainExceptionFilter(),
  );

  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

 
  const configService = app.get(ConfigService);


  const port = configService.get<number>('PORT') || 8080;

  // 3. Truyền port vào hàm listen
  await app.listen(port);
  
  // (Tùy chọn) In ra log để dễ dàng biết server đang chạy ở port nào
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();