import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";

@Controller('auth')
export class AuthController {
    
    constructor(private authService:AuthService) {

    }

    @Post('signin')
    signin(@Body() dto: AuthDto){
        const {email, password} = dto;
        
        return {email, password}
    }

    @Post('signup')
    signup() {
        return 'Youve signed up'
    }

    @Get('testing')
    testing() {
        return 'This is a test'
    }
}