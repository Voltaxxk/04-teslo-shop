import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsOptional, IsPositive, Min } from "class-validator"


export class PaginationDto {
    
    @ApiProperty({
        example : 10,
        description : 'Number of items per page',
        default : 10
    })
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    limit? : number


    @ApiProperty({
        example : 0,
        description : 'Number of items to skip',
        default : 0
    })
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    offset? : number
}