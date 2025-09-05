import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class invitationDto {
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    permission: string
}