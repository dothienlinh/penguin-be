import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { UsersService } from '@apis/users/users.service';
import { ChatRoom } from '../entities/chat-room.entity';
import { CreateChatRoomDto } from '../dto/create-chat-room.dto';
import { UpdateNameChatRoomDto } from '../dto/update-name-chat-room.dto';
import { BaseService } from '@libs/base/base.service';

@Injectable()
export class ChatRoomsService extends BaseService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomsRepository: Repository<ChatRoom>,
    private readonly usersService: UsersService,
  ) {
    super(ChatRoomsService.name);
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

  async findOne(id: number) {
    try {
      const chatRoom = await this.chatRoomsRepository.findOneBy({ id: id });
      if (!chatRoom) {
        throw new NotFoundException('Chat room not found');
      }
      return plainToInstance(ChatRoom, chatRoom);
    } catch (error) {
      this.handleError(error, 'Get chat room failed');
    }
  }

  async findChatRoomRelations(id: number) {
    try {
      const chatRoom = await this.chatRoomsRepository.findOne({
        where: { id: id },
        relations: ['members', 'messages'],
      });

      if (!chatRoom) {
        throw new NotFoundException('Chat room not found');
      }

      return chatRoom;
    } catch (error) {
      this.handleError(error, 'Get chat room failed');
    }
  }

  async updateName(id: number, updateNameChatRoomDto: UpdateNameChatRoomDto) {
    try {
      await this.chatRoomsRepository.update({ id: id }, updateNameChatRoomDto);
      return plainToInstance(ChatRoom, await this.findOne(id));
    } catch (error) {
      this.handleError(error, 'Update chat room name failed');
    }
  }

  async remove(id: number) {
    try {
      const chatRoom = await this.findChatRoomRelations(id);
      await this.chatRoomsRepository.softRemove(chatRoom);
      return { success: true };
    } catch (error) {
      this.handleError(error, 'Delete chat room failed');
    }
  }

  async restore(id: number) {
    try {
      const chatRoom = await this.findChatRoomRelations(id);
      await this.chatRoomsRepository.recover(chatRoom);
      return this.findOne(id);
    } catch (error) {
      this.handleError(error, 'Restore chat room failed');
    }
  }
}
