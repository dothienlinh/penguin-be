import { Post } from '@apis/posts/entities/post.entity';
import { BaseEntity } from '@libs/base/base.entity';
import { ImageType } from '@libs/enums';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Image extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'varchar', length: 20, default: ImageType.THUMBNAIL })
  type: ImageType;

  @Column({ type: 'varchar', length: 255, name: 'asset_id', nullable: true })
  assetId: string;

  @Column({ type: 'varchar', length: 255, name: 'public_id', nullable: true })
  publicId: string;

  @ManyToOne(() => Post, (post) => post.images, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
