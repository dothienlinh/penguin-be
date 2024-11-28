import { User } from '@apis/users/entities/user.entity';
import { BaseEntity } from '@libs/base/base.entity';
import { NotificationType } from '@libs/enums';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 255 })
  type: NotificationType;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  link: string;

  @Column({ type: 'json', nullable: true })
  data: Record<string, any>;

  @ManyToOne(() => User, (user) => user.notifications, { nullable: false })
  user: User;
}
