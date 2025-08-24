import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.enableCors();
  
  // Enable global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // Enable validation globally with comprehensive validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false, // Allow extra properties for flexibility in partial updates
    transform: true,
    skipMissingProperties: true, // Allow partial data for autosave operations
    skipNullProperties: false,
    skipUndefinedProperties: false,
    validationError: {
      target: false,
      value: false,
    },
    exceptionFactory: (errors) => {
      const formattedErrors = errors.map(error => ({
        property: error.property,
        value: error.value,
        constraints: error.constraints,
        children: error.children?.map(child => ({
          property: child.property,
          constraints: child.constraints,
        })),
      }));
      
      return new Error(JSON.stringify(formattedErrors));
    },
  }));
  
  // Setup Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Buena Property Management API')
    .setDescription('A comprehensive API for efficient property onboarding and management, handling both WEG (condominium) and MV (rental) properties with support for bulk data entry and AI-powered document extraction.')
    .setVersion('1.0')
    .addTag('properties', 'Property management endpoints')
    .addTag('statistics', 'Property statistics and analytics')
    .setContact('Buena Property Management', 'https://buena.example.com', 'support@buena.example.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Development server')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Buena Property Management API Documentation',
  });
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation is available at: http://localhost:${port}/api/docs`);
}
bootstrap();
