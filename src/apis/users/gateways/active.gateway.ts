import { BaseService } from '@libs/base/base.service';
import { WebSocketAuthMiddleware } from '@libs/middlewares/websocket-auth.middleware';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../users.service';

@WebSocketGateway({
  namespace: 'active',
})
export class ActiveGateway
  extends BaseService
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super(ActiveGateway.name);
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

  async handleConnection(client: Socket) {
    try {
      const user = client.data.user;
      if (!user) {
        client.disconnect();
        return;
      }

      await this.usersService.updateActiveStatus(user.id, true);

      this.server.emit('userActive', { userId: user.id, isActive: true });

      client.join(`user:${user.id}`);
    } catch (error) {
      this.logger.error(`Error in handleConnection: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const user = client.data.user;
      if (!user) return;

      await this.usersService.updateActiveStatus(user.id, false);

      this.server.emit('userInactive', { userId: user.id, isActive: false });
    } catch (error) {
      this.logger.error(`Error in handleDisconnect: ${error.message}`);
    }
  }
}
