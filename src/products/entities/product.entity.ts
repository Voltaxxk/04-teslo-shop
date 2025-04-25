import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({
    name: 'products'
})
export class Product {

    @ApiProperty({
        example : '5f8d9f0a-d7d1-4d2b-b7e1-e9e0c7c2e4f5',
        description : 'Product id',
        uniqueItems : true
    })
    @PrimaryGeneratedColumn('uuid')
    id : string;

    @ApiProperty({
        example : 'T-shirt Teslo',
        description : 'Product title',
        uniqueItems : true
    })
    @Column('text', {
        unique: true
    })
    title : string

    @ApiProperty({
        example : 0,
        description : 'Product price',
    })
    @Column('float', {
        default: 0
    })
    price : number

    @ApiProperty({
        example : 'Product description',
        description : 'Product description',
        default : null
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description : string

    @ApiProperty({
        example : 't-shirt_teslo',
        description : 'Product slug for SEO',
        uniqueItems : true
    })
    @Column({
        type: 'text',
        unique: true
    })
    slug : string

    @ApiProperty({
        example : 10,
        description : 'Product stock',
        default : 0
    })
    @Column({
        type: 'int',
        default: 0
    })
    stock : number

    @ApiProperty({
        example : ["M", "L", "XL"],
        description : 'Product Sizes',
    })
    @Column({
        type: 'text',
        array: true,
    })
    sizes : string[]

    @ApiProperty({
        example : 'Male',
        description : 'Product gender',
    })
    @Column({
        type: 'text'
    })
    gender : string

    @ApiProperty({
        example : ['Yellow', 'Black', 'T-Shirt'],
        description : 'Product tags',
    })
    @Column({
        type: 'text',
        array: true,
        default : []
    })
    tags : string[]

    @ApiProperty()
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        {cascade: true, eager : true}
    )
    images? : ProductImage[];

    @ManyToOne(
        () => User,
        (user) => user.products,
        {eager : true}
    )
    user : User

    @BeforeInsert()
    checkSlugInsert() {
        if(!this.slug){
            this.slug = this.title
        }

       this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '');

    }    


    @BeforeUpdate()
    checkSlugUpdate() {
       this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '');
    }
}
