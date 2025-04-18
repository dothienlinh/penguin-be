import { UsersService } from '@apis/users/users.service';
import { BaseGateway } from '@libs/base/base.gateway';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationsService } from '../notifications.service';

@WebSocketGateway({
  namespace: 'notifications',
})
export class NotificationGateway
  extends BaseGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    protected readonly usersService: UsersService,
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {
    super(jwtService, configService, usersService, NotificationGateway.name);
  }

  private userClient(client: Socket) {
    const user = client.data.user;
    if (!user) {
      client.disconnect();
      return null;
    }

    return user;
  }

  async handleConnection(client: Socket) {
    const user = this.userClient(client);

    if (!user) {
      client.disconnect();
      return;
    }

    client.join(`user:${user.id}`);
  }

  async handleDisconnect(client: Socket) {
    const user = this.userClient(client);

    if (!user) {
      client.disconnect();
      return;
    }

    client.leave(`user:${user.id}`);
  }

  @SubscribeMessage('sendNotification')
  async sendNotification(
    @MessageBody() data: CreateNotificationDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = this.userClient(client);
      if (!user) {
        client.disconnect();
        return;
      }

      const notification = await this.notificationsService.create(
        data,
        user.id,
      );

      this.server
        .to(`user:${notification.user.id}`)
        .emit('receiveNotification', notification);

      return {
        success: true,
        notification,
      };
    } catch (error) {
      this.handleError(error, 'Send notification failed');
    }
  }

  @SubscribeMessage('countNotificationsNotRead')
  async countNotificationsNotRead(@ConnectedSocket() client: Socket) {
    try {
      const user = this.userClient(client);
      if (!user) {
        client.disconnect();
        return;
      }

      const count = await this.notificationsService.countNotificationsNotRead(
        user.id,
      );

      return {
        success: true,
        count,
      };
    } catch (error) {
      this.handleError(error, 'Count notifications not read failed');
    }
  }
}
