import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  // Enable validation globally with partial validation for drafts
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false, // Allow extra properties for flexibility
    transform: true,
    skipMissingProperties: true, // Allow partial data for drafts
    skipNullProperties: false,
    skipUndefinedProperties: false,
  }));
  
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
