// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(compression());
  
  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'https://bingo-vintage.vercel.app', // ✅ Your Vercel link
      'https://bingvintage-production.up.railway.app',
    ], 
    credentials: true,
  });

  app.setGlobalPrefix('api'); //

  const config = new DocumentBuilder()
    .setTitle('Bingo_vintage API')
    .setDescription('Motorcycle Loan Management System API')
    .setVersion('1.0')
    // ✅ FIX: Remove /api from the server URL to prevent doubling
    .addServer('https://bingvintage-production.up.railway.app', 'Production') 
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // ✅ FIX: Use 'docs' as the path and set useGlobalPrefix to true
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true, 
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'BikeSure API Docs',
  });

  await app.listen(process.env.PORT || 8080, '0.0.0.0');
}
bootstrap();