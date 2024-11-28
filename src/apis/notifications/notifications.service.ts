import { User } from '@apis/users/entities/user.entity';
import { QueryListDto } from '@libs/base/base.dto';
import { BaseService } from '@libs/base/base.service';
import { AccessControl } from '@libs/utils/access-control.util';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';
import { responsePagination } from '@libs/utils/response-pagination.util';

@Injectable()
export class NotificationsService extends BaseService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {
    super(NotificationsService.name);
  }

  async create(createNotificationDto: CreateNotificationDto, userId: number) {
    try {
      const notification = this.notificationRepository.create({
        ...createNotificationDto,
        user: { id: userId },
      });
      return await this.notificationRepository.save(notification);
    } catch (error) {
      this.handleError(error, 'Create notification failed');
    }
  }

  async countNotificationsNotRead(userId: number) {
    try {
      return await this.notificationRepository.count({
        where: { user: { id: userId }, isRead: false },
      });
    } catch (error) {
      this.handleError(error, 'Count notifications not read failed');
    }
  }

  async readNotifications(user: User, id: number) {
    try {
      const userId = user.id;

      const notification = await this.notificationRepository.findOneBy({
        user: { id: userId },
        isRead: false,
        id,
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      if (notification.isRead) {
        throw new BadRequestException('Notification already read');
      }

      AccessControl.checkUserAccess(user, notification.user.id);

      return await this.notificationRepository.update(
        { user: { id: userId }, isRead: false, id },
        { isRead: true },
      );
    } catch (error) {
      this.handleError(error, 'Read notifications failed');
    }
  }

  async findAll(user: User, query: QueryListDto) {
    try {
      const { page, size, orderBy } = query;

      const queryBuilder = this.notificationRepository
        .createQueryBuilder('notification')
        .leftJoin('notification.user', 'user')
        .where('user.id = :userId', { userId: user.id })
        .orderBy('notification.createdAt', orderBy);

      return responsePagination(queryBuilder, page, size, Notification);
    } catch (error) {
      this.handleError(error, 'Find all notifications failed');
    }
  }

  async remove(id: number) {
    try {
      return await this.notificationRepository.softRemove({ id });
    } catch (error) {
      this.handleError(error, 'Remove notification failed');
    }
  }
}
