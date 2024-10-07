import { Post } from '@apis/posts/entities/post.entity';
import { BaseEntity } from '@libs/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Image extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  url: string;

  @ManyToOne(() => Post, (post) => post.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
