import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../messages/entities/message.entity';

@Injectable()
export class ChatHistoryService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async getChatHistory(chatRoomId: number, limit: number, offset: number) {
    return this.messageRepository.find({
      where: { chatRoom: { id: chatRoomId } },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['sender', 'receiver'],
    });
  }
}
