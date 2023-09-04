import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtGuard } from 'src/auth/guards';
import { GetUser } from 'src/auth/decorators';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }
}
