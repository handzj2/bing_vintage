// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression'; // ✅ Correct way to import compression
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security & Optimization
  app.use(helmet());
  app.use(compression()); // ✅ This will now work as a function
  
  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'https://bingo-vintage.vercel.app', 
      'https://bingvintage-production.up.railway.app',
    ], 
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Bingo_vintage API')
    .setDescription('Motorcycle Loan Management System API')
    .setVersion('1.0')
    .addServer('https://bingvintage-production.up.railway.app', 'Production')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true, 
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'BikeSure API Docs',
  });

  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');
}
bootstrap();