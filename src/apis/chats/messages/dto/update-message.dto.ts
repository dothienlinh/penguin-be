import { OmitType } from '@nestjs/swagger';
import { CreateMessageDto } from './create-message.dto';

export class UpdateMessageDto extends OmitType(CreateMessageDto, [
  'senderId',
  'receiverId',
] as const) {}
