import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { BaseModule } from './base/base.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    BookmarksModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    BaseModule,
  ],
})
export class AppModule {}
