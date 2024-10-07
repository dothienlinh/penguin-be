import { Comment } from '@apis/comments/entities/comment.entity';
import { Post } from '@apis/posts/entities/post.entity';
import { User } from '@apis/users/entities/user.entity';
import { BaseEntity } from '@libs/base/base.entity';
import { LikeType } from '@libs/enums';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Like extends BaseEntity {
  @Column({ name: 'post_id', nullable: true })
  postId: number;

  @Column({ name: 'comment_id', nullable: true })
  commentId: number;

  @Column({ name: 'target_type', type: 'enum', enum: LikeType })
  targetType: LikeType;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, (post) => post.likes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => Comment, (comment) => comment.likes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;
}
