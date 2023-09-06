import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signin(dto: SignInDto) {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Invalid email');
    }

    const pwMatch = await argon.verify(user.hash, password);

    if (!pwMatch) {
      throw new ForbiddenException('Invalid email/password convination');
    }

    return this.signToken(user.id, user.email);
  }
  async signup(dto: SignUpDto) {
    const { password } = dto;
    const hash = await argon.hash(password);
    delete dto.password;
    try {
      const user = await this.prisma.user.create({
        data: {
          ...dto,
          hash,
        },
      });

      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }

      throw error;
    }
  }

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      userId,
      email,
    };

    const secret = this.config.get('POSTGRES_PASSWORD');
    const token = await this.jwt.signAsync(payload);

    return {
      access_token: token,
    };
  }
}
