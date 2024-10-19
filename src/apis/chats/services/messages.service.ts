import { ErrorHandler } from '@libs/utils/error-handler';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { CreateMessageDto } from '../dto/create-message.dto';
import { Message } from '../entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
  ) {}

  private readonly logger = new Logger(MessagesService.name);

  private handleError(error: any, message: string): never {
    this.logger.error(`${message}: ${error.message}`);
    return ErrorHandler.handle(error, message);
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
