import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { SignInDto, SignUpDto } from "./dto";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService){

    }
    async signin(dto: SignInDto){
        const { email, password } = dto;
        const user = await this.prisma.user.findUnique({
            where: {
                email,
            }
        })

        if(!user) {
            throw new ForbiddenException('Invalid email');
        }

        const pwMatch = await argon.verify(user.hash, password);

        if(!pwMatch) {
            throw new ForbiddenException('Invalid email/password convination');
        }

        delete user.hash

        return user;
    }
    async signup(dto: SignUpDto){
        const { password } = dto;
        const hash = await argon.hash(password)
        delete dto.password
        try {
            const user = await this.prisma.user.create({
                data: {
                    ...dto,
                    hash,
                }
            })

            delete user.hash
            return user;
        } catch (error) {
            if(error instanceof PrismaClientKnownRequestError) {
                if(error.code === "P2002") {
                    throw new ForbiddenException('Credentials taken')
                }
            }

            throw error
        }
    }
}