import { Post } from '@apis/posts/entities/post.entity';
import { BaseEntity } from '@libs/base/base.entity';
import { Column, JoinTable, ManyToMany } from 'typeorm';

export class Category extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Post, (post) => post.categories)
  @JoinTable({
    name: 'post_categories',
    joinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'post_id',
      referencedColumnName: 'id',
    },
  })
  posts: Post[];
}
