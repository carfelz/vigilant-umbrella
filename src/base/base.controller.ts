import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BaseService } from './base.service';

@Controller()
export class BaseController {
  constructor(private readonly baseService: BaseService) {}
  @Get()
  base() {
    return 'Hello world!';
  }
}
