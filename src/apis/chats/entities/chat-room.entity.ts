import { Message } from '@apis/chats/entities/message.entity';
import { User } from '@apis/users/entities/user.entity';
import { BaseEntity } from '@libs/base/base.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';

@Entity()
export class ChatRoom extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: false })
  isGroup: boolean;

  @OneToMany(() => Message, (message) => message.chatRoom, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  messages: Message[];

  @ManyToMany(() => User, (user) => user.chatRooms)
  @JoinTable({
    name: 'members_chat_rooms',
    joinColumn: {
      name: 'chat_room_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  members: User[];
}
