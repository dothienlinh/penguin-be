import { User } from '@apis/users/entities/user.entity';
import { BaseEntity } from '@libs/base/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Roles } from '@libs/enums';

@Entity()
export class Role extends BaseEntity {
  @Column({ type: 'enum', enum: Roles, unique: true })
  name: Roles;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
