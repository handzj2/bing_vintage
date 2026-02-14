import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security & Optimization
  app.use(helmet());
  app.use(compression());
  
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3005',
      'http://localhost:5000',
      'https://bingo-vintage.vercel.app', // ✅ Add your Vercel link here
      'https://bingvintage-production.up.railway.app',
    ],
    credentials: true,
  });

  // Data Validation
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // STEP 1: Add global prefix FIRST
  app.setGlobalPrefix('api');

  // STEP 2: Setup Swagger AFTER prefix (so it appears at /api/docs)
  const config = new DocumentBuilder()
    .setTitle('Bingo_vintage API')
    .setDescription('Motorcycle Loan Management System API')
    .setVersion('1.0')
    .addServer('https://bingvintage-production.up.railway.app/api', 'Production')
    .addServer('http://localhost:5000/api', 'Local Development')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Setup Swagger at /api/docs (after prefix is set)
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'BikeSure API Docs',
  });

  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger UI available at: http://localhost:${port}/api/docs`);
  console.log(`🔐 API endpoints: http://localhost:${port}/api/auth/...`);
}
bootstrap();