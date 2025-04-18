import { BaseService } from './base.service';
import { WebSocketAuthMiddleware } from '@libs/middlewares/websocket-auth.middleware';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@apis/users/users.service';
import { OnGatewayInit, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

export class BaseGateway extends BaseService implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    protected readonly usersService: UsersService,
    serviceName: string,
  ) {
    super(serviceName);
  }

  afterInit() {
    this.server.use(
      WebSocketAuthMiddleware(
        this.jwtService,
        this.configService,
        this.usersService,
        this.logger,
      ),
    );
  }
}
