import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { ChatRoom } from './schemas/chat-room.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { UsersService } from '@apis/users/users.service';
import { UpdateNameChatRoomDto } from './dto/update-name-chat-room.dto';
import { ErrorHandler } from '@libs/utils/error-handler';

@Injectable()
export class ChatRoomsService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomsRepository: Repository<ChatRoom>,
    private readonly usersService: UsersService,
  ) {}

  private readonly logger = new Logger(ChatRoomsService.name);

  private handleError(error: any, message: string): never {
    this.logger.error(`${message}: ${error.message}`);
    return ErrorHandler.handle(error, message);
  }

  async create(createChatRoomDto: CreateChatRoomDto) {
    try {
      const { members } = createChatRoomDto;
      const users = await this.usersService.findByIds(members);

      if (users.length !== members.length) {
        throw new NotFoundException('User not found');
      }

      const chatRoom = this.chatRoomsRepository.create({
        ...createChatRoomDto,
        members: users,
      });
      return plainToInstance(
        ChatRoom,
        await this.chatRoomsRepository.save(chatRoom),
      );
    } catch (error) {
      this.handleError(error, 'Create chat room failed');
    }
  }

  async findAll() {
    try {
      const chatRooms = await this.chatRoomsRepository.find();
      return plainToInstance(ChatRoom, chatRooms);
    } catch (error) {
      this.handleError(error, 'Get chat rooms failed');
    }
  }

  async findOne(id: ObjectId) {
    try {
      const chatRoom = await this.chatRoomsRepository.findOneBy({ _id: id });
      return plainToInstance(ChatRoom, chatRoom);
    } catch (error) {
      this.handleError(error, 'Get chat room failed');
    }
  }

  async updateName(id: ObjectId, updateNameChatRoomDto: UpdateNameChatRoomDto) {
    try {
      await this.chatRoomsRepository.update({ _id: id }, updateNameChatRoomDto);
    } catch (error) {
      this.handleError(error, 'Update chat room name failed');
    }
  }

  async remove(id: ObjectId) {
    try {
      await this.chatRoomsRepository.softDelete({ _id: id });
    } catch (error) {
      this.handleError(error, 'Delete chat room failed');
    }
  }
}
