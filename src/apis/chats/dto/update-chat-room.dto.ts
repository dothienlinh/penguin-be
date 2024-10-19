import { OmitType } from '@nestjs/swagger';
import { CreateChatRoomDto } from './create-chat-room.dto';

export class UpdateChatRoomDto extends OmitType(
  CreateChatRoomDto,
  [] as const,
) {}
