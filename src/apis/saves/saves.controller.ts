import { Controller, Post, Body, Delete } from '@nestjs/common';
import { SavesService } from './saves.service';
import { CreateSaveDto } from './dto/create-save.dto';
import { User } from '@apis/users/entities/user.entity';
import { CurrentUser } from '@libs/decorators/user.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '@libs/decorators/responseMessage.decorator';

@ApiTags('Saves')
@Controller('saves')
export class SavesController {
  constructor(private readonly savesService: SavesService) {}

  @Post()
  @ApiOperation({ summary: 'Save a post' })
  @ResponseMessage('Save a post successfully')
  async savePost(
    @Body() createSaveDto: CreateSaveDto,
    @CurrentUser() user: User,
  ) {
    return await this.savesService.savePost(createSaveDto, user);
  }

  @Delete()
  @ApiOperation({ summary: 'Unsave a post' })
  @ResponseMessage('Unsave a post successfully')
  async unSavePost(
    @Body() createSaveDto: CreateSaveDto,
    @CurrentUser() user: User,
  ) {
    return await this.savesService.unSavePost(createSaveDto, user);
  }
}
