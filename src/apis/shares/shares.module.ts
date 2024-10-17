import { Module } from '@nestjs/common';
import { SharesService } from './shares.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Share } from './entities/share.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Share])],
  providers: [SharesService],
  exports: [SharesService],
})
export class SharesModule {}
