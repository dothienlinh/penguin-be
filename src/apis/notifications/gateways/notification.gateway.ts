import { UsersService } from '@apis/users/users.service';
import { BaseService } from '@libs/base/base.service';
import { WebSocketAuthMiddleware } from '@libs/middlewares/websocket-auth.middleware';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationsService } from '../notifications.service';

@WebSocketGateway({
  namespace: 'notifications',
})
export class NotificationGateway
  extends BaseService
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {
    super(NotificationGateway.name);
  }

  private userClient(client: Socket) {
    const user = client.data.user;
    if (!user) {
      client.disconnect();
      return null;
    }

    return user;
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
