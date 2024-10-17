import { Like } from '@apis/likes/entities/like.entity';
import { Post } from '@apis/posts/entities/post.entity';
import { User } from '@apis/users/entities/user.entity';
import { BaseEntity } from '@libs/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Comment extends BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @OneToMany(() => Like, (like) => like.comment, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.parentComment, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  replyComments: Comment[];

  @ManyToOne(() => Comment, (comment) => comment.replyComments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_comment_id' })
  parentComment: Comment;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
