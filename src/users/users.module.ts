import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  controllers: [UsersModule],
})
export class UsersModule {}
