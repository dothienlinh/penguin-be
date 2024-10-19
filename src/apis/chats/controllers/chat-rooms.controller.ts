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
import { Permissions } from '@libs/decorators/permissions.decorator';
import { Permission } from '@libs/enums';

@ApiTags('Chat Rooms')
@Controller('chat-rooms')
export class ChatRoomsController {
  constructor(private readonly chatRoomsService: ChatRoomsService) {}

  @Post()
  @Permissions(Permission.WRITE_CHAT)
  create(@Body() createChatRoomDto: CreateChatRoomDto) {
    return this.chatRoomsService.create(createChatRoomDto);
  }

  @Permissions(Permission.READ_CHAT)
  @Get()
  findAll() {
    return this.chatRoomsService.findAll();
  }

  @Permissions(Permission.READ_CHAT)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.chatRoomsService.findOne(id);
  }

  @Permissions(Permission.UPDATE_CHAT)
  @Put(':id')
  updateName(
    @Param('id') id: number,
    @Body() updateNameChatRoomDto: UpdateNameChatRoomDto,
  ) {
    return this.chatRoomsService.updateName(id, updateNameChatRoomDto);
  }

  @Permissions(Permission.DELETE_CHAT)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.chatRoomsService.remove(id);
  }
}
