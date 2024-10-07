import { Controller } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}
}
