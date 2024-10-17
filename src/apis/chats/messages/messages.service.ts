import { Injectable, Logger } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './schemas/message.schema';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { ErrorHandler } from '@libs/utils/error-handler';

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
}
