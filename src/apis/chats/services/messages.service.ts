import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { CreateMessageDto } from '../dto/create-message.dto';
import { Message } from '../entities/message.entity';
import { BaseService } from '@libs/base/base.service';

@Injectable()
export class MessagesService extends BaseService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
  ) {
    super(MessagesService.name);
  }

  async create(createMessageDto: CreateMessageDto) {
    try {
      const message = this.messagesRepository.create(createMessageDto);
      return plainToInstance(
        Message,
        await this.messagesRepository.save(message),
      );
    } catch (error) {
      this.handleError(error, 'Create message failed');
    }
  }

  async markAsRead(messageId: number) {
    try {
      const message = await this.messagesRepository.findOne({
        where: { id: messageId },
        relations: ['chatRoom'],
      });
      if (!message) {
        throw new NotFoundException('Message not found');
      }
      message.isRead = true;
      message.readAt = new Date();
      return await this.messagesRepository.save(message);
    } catch (error) {
      this.handleError(error, 'Mark message as read failed');
    }
  }
}
