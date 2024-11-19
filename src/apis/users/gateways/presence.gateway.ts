import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@libs/configs/redis/redis.service';
import { BaseService } from '@libs/base/base.service';

@WebSocketGateway({
  namespace: 'presence',
})
export class PresenceGateway
  extends BaseService
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    super(PresenceGateway.name);
  }

  private async getUserFromSocket(client: Socket) {
    const token = client.handshake.auth.token;

    if (!token) {
      return null;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>('ACCESS_SECRET_JWT'),
      });

      return await this.usersService.findOneById(payload.sub);
    } catch {
      return null;
    }
  }

  async handleConnection(client: Socket) {
    try {
      const user = await this.getUserFromSocket(client);
      if (!user) {
        client.disconnect();
        return;
      }

      await this.redisService.set({
        key: `user_socket:${user.id}`,
        value: client.id,
        expired: 24 * 60 * 60, // 24 hours
      });

      await this.usersService.updateActiveStatus(user.id, true);

      this.server.emit('userActive', { userId: user.id });

      client.join(`user:${user.id}`);
    } catch (error) {
      this.logger.error(`Error in handleConnection: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const user = await this.getUserFromSocket(client);
      if (!user) return;

      await this.redisService.del(`user_socket:${user.id}`);

      await this.usersService.updateActiveStatus(user.id, false);

      this.server.emit('userInactive', { userId: user.id });
    } catch (error) {
      this.logger.error(`Error in handleDisconnect: ${error.message}`);
    }
  }
}
