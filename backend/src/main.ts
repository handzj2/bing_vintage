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
  
  // 🛡️ FIX: Added wildcard for Vercel and fixed the CORS handshake
  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'https://bingo-vintage.vercel.app', 
      'https://bingvintage-production.up.railway.app',
      /\.vercel\.app$/, // Allows all Vercel preview/branch deployments
    ], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 🌍 Global Prefix - IMPORTANT: All frontend URLs must include /api/
  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Bingo_vintage API')
    .setDescription('Motorcycle Loan Management System API')
    .setVersion('1.0')
    // ✅ FIX: Added /api to the production server URL
    .addServer('https://bingvintage-production.up.railway.app/api', 'Production')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Swagger will be at /api/docs
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'BikeSure API Docs',
  });

  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');
}
bootstrap();