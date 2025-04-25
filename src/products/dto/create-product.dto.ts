import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator"

export class CreateProductDto {

    @ApiProperty({
        example : 'T-shirt Teslo',
        description : 'Product title (unique)',
        uniqueItems : true,
        nullable : false,
    })
    @IsString()
    @MinLength(1)
    title : string

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price? : number

    @ApiProperty()
    @IsString()
    @IsOptional()
    description? : string

    @ApiProperty()
    @IsString()
    @IsOptional()
    slug? : string

    @ApiProperty()
    @IsInt()
    @IsOptional()
    @IsPositive()
    stock? : number

    @ApiProperty()
    @IsString({
        each : true
    })
    @IsArray()
    sizes : string[]

    @ApiProperty()
    @IsIn(['men', 'women', 'unisex', 'kid'])
    gender : string

    @ApiProperty()
    @IsString({
        each : true
    })
    @IsArray()
    @IsOptional()
    tags? : string[]

    @ApiProperty()
    @IsString({
        each : true
    })
    @IsArray()
    @IsOptional()
    images? : string[]

}
