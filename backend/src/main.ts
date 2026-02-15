// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Enable CORS for your Vercel frontend
  app.enableCors({
    origin: ['https://bingo-vintage.vercel.app'], 
    credentials: true,
  });

  // 2. Set Global Prefix FIRST
  app.setGlobalPrefix('api');

  // 3. Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Bingo_vintage API')
    .setVersion('1.0')
    // ✅ REMOVE "/api" from the end of this URL
    .addServer('https://bingvintage-production.up.railway.app', 'Production') 
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // 4. Setup Swagger with Global Prefix
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true, // 👈 This makes the URL /api/docs work correctly
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT || 8080, '0.0.0.0');
}
bootstrap();