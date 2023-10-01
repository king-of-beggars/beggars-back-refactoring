require('dotenv').config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './Utils/swagger.util';
let cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  setupSwagger(app);
  app.enableCors({ 
    origin: [ 
      'https://beggars-front-eight.vercel.app',
      'https://deeplake-beggars-front.vercel.app',
      'https://dev-beggars-front-eight.vercel.app',
      'http://localhost:3000',
    ], 
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    exposedHeaders: ['Set-Cookie', 'userId', 'userNickname'],
  });
  await app.listen(3000);
}
bootstrap();
