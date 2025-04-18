import { BaseGateway } from '@libs/base/base.gateway';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UsersService } from '../users.service';

@WebSocketGateway({
  namespace: 'active',
})
export class ActiveGateway
  extends BaseGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    protected readonly usersService: UsersService,
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
  ) {
    super(jwtService, configService, usersService, ActiveGateway.name);
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
