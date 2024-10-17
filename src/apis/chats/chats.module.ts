import { Module } from '@nestjs/common';
import { ChatsGateway } from './gateways/chats.gateway';
import { JwtModule } from '@nestjs/jwt';
import { MessagesController } from './messages/messages.controller';
import { ChatRoomsController } from './chat-rooms/chat-rooms.controller';
import { ChatRoomsService } from './chat-rooms/chat-rooms.service';
import { MessagesService } from './messages/messages.service';
import { UsersModule } from '@apis/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './chat-rooms/schemas/chat-room.schema';
import { Message } from './messages/schemas/message.schema';
import { OfflineMessagesService } from './services/offlineMessages.service';
import { RedisModule } from '@libs/configs/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, Message]),
    JwtModule,
    UsersModule,
    RedisModule,
  ],
  controllers: [MessagesController, ChatRoomsController],
  providers: [
    ChatsGateway,
    ChatRoomsService,
    MessagesService,
    OfflineMessagesService,
  ],
})
export class ChatsModule {}
