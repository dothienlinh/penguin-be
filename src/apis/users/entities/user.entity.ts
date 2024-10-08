import { Comment } from '@apis/comments/entities/comment.entity';
import { Like } from '@apis/likes/entities/like.entity';
import { Post } from '@apis/posts/entities/post.entity';
import { Share } from '@apis/shares/entities/share.entity';
import { BaseEntity } from '@libs/base/base.entity';
import { Gender, Provider, Roles } from '@libs/enums';
import { Exclude } from 'class-transformer';
import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  @Exclude()
  password: string;

  @Column({ type: 'varchar', name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', name: 'first_name' })
  firstName: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'date', nullable: true, name: 'birth_date' })
  birthDate: Date;

  @Column({ default: false, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_verified' })
  isVerified: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_published' })
  isPublished: boolean;

  @Column({ type: 'enum', enum: Provider, default: Provider.EMAIL })
  provider: Provider;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
    name: 'facebook_id',
  })
  facebookId: string;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
    name: 'google_id',
  })
  googleId: string;

  @Column({ type: 'text', nullable: true, name: 'refresh_token' })
  @Exclude()
  refreshToken: string;

  @Column({ type: 'enum', enum: Roles, default: Roles.USER })
  role: Roles;

  @OneToMany(() => Post, (post) => post.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  likes: Like[];

  @OneToMany(() => Share, (share) => share.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  shares: Share[];

  @ManyToMany(() => User, (user) => user.followers, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable({ name: 'followers' })
  followers: User[];

  @ManyToMany(() => User, (user) => user.following, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable({ name: 'following' })
  following: User[];
}
