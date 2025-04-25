import { IsString, MinLength } from "class-validator";


export class NewMessageDto {

    @IsString()
    @MinLength(1)
    // id : string
    message : string

}