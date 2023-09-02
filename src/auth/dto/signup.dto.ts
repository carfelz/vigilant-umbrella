import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator"

export class SignUpDto {
    @IsString()
    @IsNotEmpty()
    firstName: string
    
    @IsString()
    @IsNotEmpty()
    lastName: string

    @IsEmail()
    email: string

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    password: string
}