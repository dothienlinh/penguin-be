import { UsersService } from '@apis/users/users.service';
import { RedisService } from '@libs/configs/redis/redis.service';
import { Payload } from '@libs/interfaces';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { MessagesService } from '../messages/messages.service';
import { OfflineMessagesService } from '../services/offlineMessages.service';
import { ErrorHandler } from '@libs/utils/error-handler';

@WebSocketGateway(8000, {
  cors: {
    origin: '*',
  },
})
export class ChatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatsGateway.name);

  constructor(
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly offlineMessagesService: OfflineMessagesService,
  ) {}

  private handleError(error: any, message: string): never {
    this.logger.error(`${message}: ${error.message}`);
    return ErrorHandler.handle(error, message);
  }

  afterInit() {
    this.logger.log('ChatsGateway initialized');
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
    try {
      const { user, expired } = await this.getUserData(client);

      await this.redisService.set({
        key: `CHAT:${user.id}`,
        value: client.id,
        expired,
      });

      // Deliver offline messages
      const offlineMessages =
        await this.offlineMessagesService.getOfflineMessages(user.id);
      if (offlineMessages.length > 0) {
        client.emit('offlineMessages', offlineMessages);
        await this.offlineMessagesService.markAsDelivered(
          offlineMessages.map((msg) => msg._id.toString()),
        );
      }
    } catch (error) {
      client.disconnect();
      this.handleError(error, 'Connect failed');
    }
  }

  async getUserData(client: Socket) {
    const bearerToken = client.handshake.headers.authorization;
    const token = bearerToken?.split(' ')[1];

    if (!token) {
      client.disconnect();
    }
    const payload: Payload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.getOrThrow<string>('ACCESS_SECRET_JWT'),
    });

    return {
      user: await this.usersService.findOneById(payload.sub),
      expired: payload.exp * 1000 - Date.now(),
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
}
