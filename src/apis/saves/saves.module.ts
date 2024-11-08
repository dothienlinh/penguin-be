import { Module } from '@nestjs/common';
import { SavesService } from './saves.service';
import { SavesController } from './saves.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Save } from './entities/save.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Save])],
  controllers: [SavesController],
  providers: [SavesService],
})
export class SavesModule {}
