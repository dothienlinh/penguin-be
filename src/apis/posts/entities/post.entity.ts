import { Comment } from '@apis/comments/entities/comment.entity';
import { Image } from '@apis/images/entities/image.entity';
import { Like } from '@apis/likes/entities/like.entity';
import { Share } from '@apis/shares/entities/share.entity';
import { User } from '@apis/users/entities/user.entity';
import { BaseEntity } from '@libs/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Post extends BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished: boolean;

  @OneToMany(() => Image, (image) => image.post, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  images: Image[];

  @OneToMany(() => Like, (like) => like.post, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.post, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  comments: Comment[];

  @OneToMany(() => Share, (share) => share.post, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  shares: Share[];

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
