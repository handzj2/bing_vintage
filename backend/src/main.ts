import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security & Optimization
  app.use(helmet());
  app.use(compression());

  // ✅ CORS configuration – allows your main domain, localhost, and any Vercel preview URL
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'https://bingo-vintage.vercel.app',
        'https://bingvintage-production.up.railway.app',
      ];

      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) {
        return callback(null, true);
      }

      // Allow any .vercel.app subdomain (for preview deployments)
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Check against the explicit list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true, // Required for cookies/authorization headers
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
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