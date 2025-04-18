import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';

export class SocketIoAdapter extends IoAdapter {
  private readonly configService: ConfigService;

  constructor(app: INestApplication) {
    super(app);
    this.configService = app.get(ConfigService);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const clientUrl = this.configService.get<string>('FRONTEND_URL');
    port = this.configService.get<number>('WS_PORT');

    const cors = {
      origin: ['*', clientUrl],
      credentials: true,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Authorization', 'Content-Type'],
      exposedHeaders: ['Authorization'],
    };

    const optionsWithCORS: ServerOptions = {
      ...options,
      cors,
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling'],
      cookie: {
        name: 'io',
        httpOnly: true,
        sameSite: 'strict',
      },
    };

    return super.createIOServer(port, optionsWithCORS);
  }
}
