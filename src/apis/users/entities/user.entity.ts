import { ChatRoom } from '@apis/chats/entities/chat-room.entity';
import { Message } from '@apis/chats/entities/message.entity';
import { Comment } from '@apis/comments/entities/comment.entity';
import { Like } from '@apis/likes/entities/like.entity';
import { Permission } from '@apis/permissions/entities/permission.entity';
import { Post } from '@apis/posts/entities/post.entity';
import { Role } from '@apis/roles/entities/role.entity';
import { Share } from '@apis/shares/entities/share.entity';
import { BaseEntity } from '@libs/base/base.entity';
import { Gender, Provider } from '@libs/enums';
import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

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

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[];

  @ManyToOne(() => Role, (role) => role.users)
  role: Role;

  @ManyToMany(() => Permission, (permission) => permission.users)
  permissions: Permission[];

  @ManyToMany(() => User, (user) => user.followers)
  @JoinTable({
    name: 'user_follows',
    joinColumn: { name: 'follower_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'following_id', referencedColumnName: 'id' },
  })
  following: User[];

  @ManyToMany(() => User, (user) => user.following)
  followers: User[];

  @ManyToMany(() => ChatRoom, (chatRoom) => chatRoom.members)
  chatRooms: ChatRoom[];
}
