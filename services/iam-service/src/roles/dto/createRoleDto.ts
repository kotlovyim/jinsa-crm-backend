import { IsNotEmpty, IsString } from "class-validator";

export class createRoleDto {
    @IsString()
    @IsNotEmpty()
    role: string

}
