import {
  Body,
  Controller,
  Get,
  HttpCode,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/index';
import { GetUser } from '../auth/decorators/index';
import { User } from '@prisma/client';
import { EditUserDto } from './dto';
import { UsersService } from './users.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @HttpCode(200)
  @Put('edit')
  editUser(@Body() dto: EditUserDto, @GetUser('id') userId: string) {
    return this.userService.editUser(userId, dto);
  }
}
