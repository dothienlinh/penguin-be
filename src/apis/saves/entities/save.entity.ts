import { Post } from '@apis/posts/entities/post.entity';
import { User } from '@apis/users/entities/user.entity';
import { BaseEntity } from '@libs/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('saves')
export class Save extends BaseEntity {
  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'post_id' })
  postId!: number;

  @ManyToOne(() => User, (user) => user.saves)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Post, (post) => post.saves)
  @JoinColumn({ name: 'post_id' })
  post!: Post;
}
