import { User } from '@apis/users/entities/user.entity';
import { BaseEntity } from '@libs/base/base.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Permission as PermissionEnum } from '@libs/enums';
import { Role } from '@apis/roles/entities/role.entity';

@Entity()
export class Permission extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  name: PermissionEnum;

  @ManyToMany(() => User, (user) => user.permissions, {
    onDelete: 'CASCADE',
  })
  users: User[];

  @ManyToMany(() => Role, (role) => role.permissions, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'permission_role',
    joinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];
}
