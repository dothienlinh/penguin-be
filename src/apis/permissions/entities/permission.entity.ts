import { User } from '@apis/users/entities/user.entity';
import { BaseEntity } from '@libs/base/base.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Permission as PermissionEnum } from '@libs/enums';

@Entity()
export class Permission extends BaseEntity {
  @Column({ type: 'enum', enum: PermissionEnum, unique: true })
  name: PermissionEnum;

  @ManyToMany(() => User, (user) => user.permissions)
  @JoinTable({
    name: 'user_permissions',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  users: User[];
}
