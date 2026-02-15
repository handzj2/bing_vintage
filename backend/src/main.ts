// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Security & CORS
  app.use(helmet());
  app.use(compression());
  
  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'https://bingo-vintage.vercel.app', // ✅ Authorized Frontend
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
    // ❌ REMOVED "/api" from the end of this URL to prevent doubling
    .addServer('https://bingvintage-production.up.railway.app', 'Production') 
    .addServer('http://localhost:8080', 'Local Development')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // 4. Mount Swagger at /api/docs
  // This ensures your docs live inside the /api prefix correctly
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'BikeSure API Docs',
  });

  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');
}
bootstrap();