import { Post } from '@apis/posts/entities/post.entity';
import { User } from '@apis/users/entities/user.entity';
import { BaseEntity } from '@libs/base/base.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Share extends BaseEntity {
  @ManyToOne(() => Post, (post) => post.shares, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => User, (user) => user.shares, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
