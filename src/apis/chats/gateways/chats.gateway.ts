import { User } from '@apis/users/entities/user.entity';
import { UsersService } from '@apis/users/users.service';
import { RedisService } from '@libs/configs/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from '../dto/create-message.dto';
import { MessagesService } from '../services/messages.service';
import { OfflineMessagesService } from '../services/offlineMessages.service';
import { BaseGateway } from '@libs/base/base.gateway';

@WebSocketGateway({
  namespace: 'chats',
})
export class ChatsGateway
  extends BaseGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly messagesService: MessagesService,
    protected readonly usersService: UsersService,
    private readonly redisService: RedisService,
    private readonly offlineMessagesService: OfflineMessagesService,
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
  ) {
    super(jwtService, configService, usersService, ChatsGateway.name);
  }

  async handleDisconnect(client: Socket) {
    try {
      const { user } = await this.getUserData(client);
      await this.redisService.del(`CHAT:${user.id}`);
      client.disconnect();
    } catch (error) {
      client.disconnect();
      this.handleError(error, 'Disconnect failed');
    }
  }

  async handleConnection(client: Socket) {
    this.logger.debug(`New connection attempt in ChatsGateway: ${client.id}`);
    try {
      this.logger.debug(`Client attempting to connect: ${client.id}`);
      const { user } = await this.getUserData(client);
      this.logger.debug(`User authenticated: ${user.id}`);

      await this.redisService.set({
        key: `CHAT:${user.id}`,
        value: client.id,
        expired: 24 * 60 * 60, // 24 hours
      });

      // Deliver offline messages
      const offlineMessages =
        await this.offlineMessagesService.getOfflineMessages(user.id);
      if (offlineMessages.length > 0) {
        client.emit('offlineMessages', offlineMessages);
        await this.offlineMessagesService.markAsDelivered(
          offlineMessages.map((msg) => msg.id),
        );
      }
    } catch (error) {
      this.logger.error(`Connection error in ChatsGateway:`, error);
      client.disconnect();
    }
  }

  async getUserData(client: Socket) {
    const user = client.data.user as User;

    if (!user) {
      client.disconnect();
    }

    return {
      user,
    };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMessageDto: CreateMessageDto,
  ) {
    try {
      const { user: sender } = await this.getUserData(client);

      const chat = await this.messagesService.create({
        ...createMessageDto,
        senderId: sender.id,
      });

      const receiverSocketId = await this.redisService.get<string>(
        `CHAT:${createMessageDto.receiverId}`,
      );

      client.emit('newMessage', chat);

      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessage', chat);
      } else {
        await this.offlineMessagesService.storeOfflineMessage(createMessageDto);
      }

      return chat;
    } catch (error) {
      if (error.name === 'ThrottlerException') {
        this.logger.warn(`Rate limit exceeded for client ${client.id}`);
        client.emit('error', {
          message: 'Rate limit exceeded. Please try again later.',
        });
      } else {
        this.logger.error(`Error in handleSendMessage: ${error.message}`);
        client.emit('error', { message: 'Failed to send message' });
      }
    }
  }

  @SubscribeMessage('typing')
  handleTyping(@MessageBody() data: { userId: number; chatRoomId: number }) {
    this.server.to(`room_${data.chatRoomId}`).emit('userTyping', data.userId);
  }

  @SubscribeMessage('read')
  async handleRead(@MessageBody() data: { userId: number; messageId: number }) {
    try {
      const message = await this.messagesService.markAsRead(data.messageId);
      this.server.to(`room_${message.chatRoom.id}`).emit('messageRead', {
        messageId: message.id,
        userId: data.userId,
      });
    } catch (error) {
      this.handleError(error, 'Mark message as read failed');
    }
  }
}
