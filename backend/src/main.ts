// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Security & Optimization
  app.use(helmet());
  app.use(compression());
  
  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'https://bingo-vintage.vercel.app', // Authorized Frontend
      'https://bingvintage-production.up.railway.app',
    ], 
    credentials: true,
  });

  // 2. Global Prefix (Applied to ALL routes)
  app.setGlobalPrefix('api');

  // 3. Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Bingo_vintage API')
    .setDescription('Motorcycle Loan Management System API')
    .setVersion('1.0')
    // REMOVED "/api" from here to prevent the double-prefix 404 error
    .addServer('https://bingvintage-production.up.railway.app', 'Production') 
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // 4. Setup Swagger with Global Prefix compatibility
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true, // This makes docs available at /api/docs
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'BikeSure API Docs',
  });

  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');
}
bootstrap();