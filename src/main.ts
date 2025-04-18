import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SocketIoAdapter } from '@libs/adapters/socketIo.adapter';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useStaticAssets(join(__dirname, '..', 'public'));

    const configService = app.get(ConfigService);
    const port = configService.getOrThrow<number>('APP_PORT');

    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.use(cookieParser());

    app.setGlobalPrefix('api');

    const config = new DocumentBuilder()
      .setTitle('Penguin API')
      .setDescription('Penguin API Documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          description: `Enter JWT token`,
          name: 'Authorization',
          bearerFormat: 'JWT',
          scheme: 'Bearer',
          type: 'http',
          in: 'Header',
        },
        'accessToken',
      )
      .addSecurityRequirements('accessToken')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    app.enableCors({
      origin: true,
      credentials: true,
    });

    const socketIoAdapter = new SocketIoAdapter(app);
    app.useWebSocketAdapter(socketIoAdapter);

    await app.listen(port);
    console.log(`Application is running on port ${port}`);
  } catch (error) {
    console.error('Bootstrap error:', error);
    process.exit(1);
  }
}

bootstrap();
