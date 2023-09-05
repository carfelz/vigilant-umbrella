import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class EditUserDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsOptional()
  firstName: string;

  @IsNotEmpty()
  @IsOptional()
  lastName: string;
}
