import { Category } from '@apis/categories/entities/category.entity';
import { Comment } from '@apis/comments/entities/comment.entity';
import { Image } from '@apis/images/entities/image.entity';
import { Like } from '@apis/likes/entities/like.entity';
import { Share } from '@apis/shares/entities/share.entity';
import { User } from '@apis/users/entities/user.entity';
import { BaseEntity } from '@libs/base/base.entity';
import { PostStatus } from '@libs/enums';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Post extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ type: 'enum', enum: PostStatus, default: PostStatus.PENDING })
  status: PostStatus;

  @Column({ type: 'boolean', default: true, name: 'is_draft' })
  isDraft: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_removed_by_admin' })
  isRemovedByAdmin: boolean;

  @Column({ type: 'text', nullable: true, name: 'removed_reason' })
  removedReason: string;

  @Column({ type: 'timestamp', nullable: true, name: 'removed_at' })
  removedAt: Date;

  @OneToMany(() => Image, (image) => image.post, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  thumbnail: Image;

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

  @ManyToMany(() => Category, (category) => category.posts, {
    cascade: true,
  })
  @JoinTable({
    name: 'post_categories',
    joinColumn: {
      name: 'post_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: Category[];
}
