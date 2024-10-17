import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useStaticAssets(join(__dirname, '..', 'public'));

    const configService = app.get(ConfigService);
    const port = configService.getOrThrow<number>('APP_PORT');

    app.useGlobalPipes(new ValidationPipe());
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
      origin: configService.getOrThrow<string>('FRONTEND_URL'),
      credentials: true,
    });

    await app.listen(port);
  } catch (error) {
    console.error('Unable to start application:', error);
    process.exit(1);
  }
}

bootstrap();
