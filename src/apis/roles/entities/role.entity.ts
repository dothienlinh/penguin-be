import { User } from '@apis/users/entities/user.entity';
import { BaseEntity } from '@libs/base/base.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { Roles } from '@libs/enums';
import { Permission } from '@apis/permissions/entities/permission.entity';

@Entity()
export class Role extends BaseEntity {
  @Column({ type: 'enum', enum: Roles, unique: true })
  name: Roles;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    onDelete: 'CASCADE',
  })
  permissions: Permission[];
}
