import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';


@Injectable()
export class PrismaService extends PrismaClient {
    // const DB_URL = this.configService.get<string>('DATABASE_USER')
    constructor() {
        super({
            datasources: {
                db: {
                    url: "postgresql://postgres:123@localhost:5434/nest?schema=public",
                }
            }
        })   
    }

}
