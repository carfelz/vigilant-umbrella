import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtGuard } from 'src/auth/guards';
import { User } from 'src/auth/decorators';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@User() user: Request) {
    return user;
  }
}
