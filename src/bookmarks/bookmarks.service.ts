import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { EditBookmarkDto } from './dto/edit-bookmark.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class BookmarksService {
  constructor(private prisma: PrismaService) {}

  async getBookmarks(userId: string) {
    try {
      return await this.prisma.bookmark.findMany({
        where: {
          userId,
        },
      });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async getBookmarkById(bookmarkId: string, userId: string) {
    try {
      const bookmark = await this.prisma.bookmark.findFirst({
        where: {
          id: bookmarkId,
          userId,
        },
      });

      if (!bookmark) {
        throw new NotFoundException();
      }

      return bookmark;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async createBookmark(dto: CreateBookmarkDto, userId: string) {
    try {
      const bookmark = await this.prisma.bookmark.create({
        data: {
          userId,
          ...dto,
        },
      });

      return bookmark;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Title or Link are already in used');
        }
      }
      throw error;
    }
  }

  async updateBookmark(
    userId: string,
    bookmarkId: string,
    dto: EditBookmarkDto,
  ) {
    try {
      const bookmark = await this.getBookmarkById(bookmarkId, userId);
      // check if user owns the bookmark
      if (!bookmark || bookmark.userId !== userId)
        throw new ForbiddenException('Access to resources denied');

      const editedBookmark = await this.prisma.bookmark.update({
        where: {
          id: bookmarkId,
        },
        data: {
          ...dto,
        },
      });

      return editedBookmark;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Title or Link are already in used');
        }
      }

      throw error;
    }
  }

  async deleteBookmark(userId: string, bookmarkId: string) {
    const bookmark = await this.getBookmarkById(bookmarkId, userId);

    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    return this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
        userId,
      },
    });
  }
}
