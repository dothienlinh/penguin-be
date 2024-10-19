import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { CreateMessageDto } from '../dto/create-message.dto';

@Injectable()
export class OfflineMessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async storeOfflineMessage(createMessageDto: CreateMessageDto): Promise<void> {
    const offlineMessage = this.messageRepository.create({
      ...createMessageDto,
      isDelivered: false,
    });
    await this.messageRepository.save(offlineMessage);
  }

  async getOfflineMessages(userId: number): Promise<Message[]> {
    return this.messageRepository.find({
      where: { receiver: { id: userId }, isDelivered: false },
    });
  }

  async markAsDelivered(messageIds: number[]): Promise<void> {
    await this.messageRepository.update(messageIds, { isDelivered: true });
  }

  async deleteDeliveredMessages(messageIds: number[]): Promise<void> {
    await this.messageRepository.delete(messageIds);
  }
}
