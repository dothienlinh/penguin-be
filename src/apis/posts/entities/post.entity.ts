import { Category } from '@apis/categories/entities/category.entity';
import { Comment } from '@apis/comments/entities/comment.entity';
import { Image } from '@apis/images/entities/image.entity';
import { Like } from '@apis/likes/entities/like.entity';
import { Save } from '@apis/saves/entities/save.entity';
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
  OneToOne,
} from 'typeorm';

@Entity()
export class Post extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ type: 'varchar', length: 20, default: PostStatus.PENDING })
  status: PostStatus;

  @Column({ type: 'boolean', default: true, name: 'is_draft' })
  isDraft: boolean;

  @Column({ type: 'text', nullable: true, name: 'deleted_reason' })
  deletedReason: string;

  @Column({ type: 'int', default: 0 })
  views: number;

  @OneToOne(() => Image, (image) => image.post, {
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

  @OneToMany(() => Save, (save) => save.post, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  saves: Save[];

  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, (user) => user.deletedPosts)
  @JoinColumn({ name: 'deleted_by_admin_id' })
  deletedByAdmin: User;

  @ManyToMany(() => Category, (category) => category.posts)
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
