import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateChatRoomDto } from '../dto/create-chat-room.dto';
import { UpdateNameChatRoomDto } from '../dto/update-name-chat-room.dto';
import { ChatRoomsService } from '../services/chat-rooms.service';

@ApiTags('Chat Rooms')
@Controller('chat-rooms')
export class ChatRoomsController {
  constructor(private readonly chatRoomsService: ChatRoomsService) {}

  @Post()
  create(@Body() createChatRoomDto: CreateChatRoomDto) {
    return this.chatRoomsService.create(createChatRoomDto);
  }

  @Get()
  findAll() {
    return this.chatRoomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.chatRoomsService.findOne(id);
  }

  @Put(':id')
  updateName(
    @Param('id') id: number,
    @Body() updateNameChatRoomDto: UpdateNameChatRoomDto,
  ) {
    return this.chatRoomsService.updateName(id, updateNameChatRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.chatRoomsService.remove(id);
  }
}
