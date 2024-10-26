import { User } from '@apis/users/entities/user.entity';
import { BaseEntity } from '@libs/base/base.entity';
import { Column, Entity, ManyToMany } from 'typeorm';
import { Permission as PermissionEnum } from '@libs/enums';

@Entity()
export class Permission extends BaseEntity {
  @Column({ type: 'enum', enum: PermissionEnum, unique: true })
  name: PermissionEnum;

  @ManyToMany(() => User, (user) => user.permissions, {
    onDelete: 'CASCADE',
  })
  users: User[];
}
