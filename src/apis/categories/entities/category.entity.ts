import { BaseEntity } from '@libs/base/base.entity';
import { Column } from 'typeorm';

export class Category extends BaseEntity {
  @Column()
  name: string;
}
