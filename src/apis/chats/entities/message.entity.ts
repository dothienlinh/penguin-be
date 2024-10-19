import { ChatRoom } from '@apis/chats/entities/chat-room.entity';
import { User } from '@apis/users/entities/user.entity';
import { BaseEntity } from '@libs/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Message extends BaseEntity {
  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.sentMessages)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages)
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: true })
  isDelivered: boolean;

  @Column({ nullable: true })
  readAt: Date;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat_room_id' })
  chatRoom: ChatRoom;
}
