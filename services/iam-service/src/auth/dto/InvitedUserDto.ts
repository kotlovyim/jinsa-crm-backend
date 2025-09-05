import { IsNotEmpty, IsString } from "class-validator";

export class invitedUserDto {
    @IsString()
    @IsNotEmpty()
    firstName: string

    @IsString()
    @IsNotEmpty()
    lastName: string

    

}