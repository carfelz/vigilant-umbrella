import { Module } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { BookMarkController } from './bookmarks.controller';

@Module({
  providers: [BookmarksService],
  controllers: [BookMarkController]
})
export class BookmarksModule {}
