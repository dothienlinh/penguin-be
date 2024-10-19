import { UsersModule } from '@apis/users/users.module';
import { RedisModule } from '@libs/configs/redis/redis.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoomsController } from './controllers/chat-rooms.controller';
import { MessagesController } from './controllers/messages.controller';
import { ChatRoom } from './entities/chat-room.entity';
import { Message } from './entities/message.entity';
import { ChatsGateway } from './gateways/chats.gateway';
import { ChatHistoryService } from './services/chat-history.service';
import { ChatRoomsService } from './services/chat-rooms.service';
import { MessagesService } from './services/messages.service';
import { OfflineMessagesService } from './services/offlineMessages.service';

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
    ChatHistoryService,
  ],
})
export class ChatsModule {}
