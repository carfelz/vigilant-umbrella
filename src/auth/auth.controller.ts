import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignInDto, SignUpDto } from "./dto";

@Controller('auth')
export class AuthController {
    
    constructor(private authService:AuthService) {

    }

    @Post('signin')
    signin(@Body() dto: SignInDto){
        return this.authService.signin(dto);        
    }

    @Post('signup')
    signup(@Body() dto: SignUpDto) {
        return this.authService.signup(dto)
    }

    @Get('testing')
    testing() {
        return 'This is a test'
    }
}