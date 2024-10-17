import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ChatRoomsService } from './chat-rooms.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { ObjectId } from 'typeorm';
import { UpdateNameChatRoomDto } from './dto/update-name-chat-room.dto';
import { ApiTags } from '@nestjs/swagger';

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
  findOne(@Param('id') id: ObjectId) {
    return this.chatRoomsService.findOne(id);
  }

  @Put(':id')
  updateName(
    @Param('id') id: ObjectId,
    @Body() updateNameChatRoomDto: UpdateNameChatRoomDto,
  ) {
    return this.chatRoomsService.updateName(id, updateNameChatRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: ObjectId) {
    return this.chatRoomsService.remove(id);
  }
}
