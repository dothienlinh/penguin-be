import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../messages/schemas/message.schema';
import { CreateMessageDto } from '../messages/dto/create-message.dto';

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
      where: { receiverId: userId, isDelivered: false },
    });
  }

  async markAsDelivered(messageIds: string[]): Promise<void> {
    await this.messageRepository.update(
      { _id: { $in: messageIds } as any },
      { isDelivered: true },
    );
  }
}
