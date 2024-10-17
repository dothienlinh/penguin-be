import { Message } from '@apis/chats/messages/schemas/message.schema';
import { User } from '@apis/users/entities/user.entity';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ChatRoom extends BaseEntity {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column()
  members: User[];

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: false })
  isGroup: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  @Exclude()
  @ApiHideProperty()
  deletedAt!: Date;

  @OneToMany(() => Message, (message) => message.chatRoom, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  messages: Message[];
}
