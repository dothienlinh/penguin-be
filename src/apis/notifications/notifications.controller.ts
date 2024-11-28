import { User } from '@apis/users/entities/user.entity';
import { QueryListDto } from '@libs/base/base.dto';
import { CurrentUser } from '@libs/decorators/user.decorator';
import { Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentUser() user: User, @Query() query: QueryListDto) {
    return this.notificationsService.findAll(user, query);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }

  @Patch(':id/read')
  readNotifications(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationsService.readNotifications(user, +id);
  }
}
