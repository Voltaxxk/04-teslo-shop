import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import {validate as IsUUID} from 'uuid'
import { ProductImage, Product } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository : Repository<Product>,
    
    @InjectRepository(ProductImage)
    private readonly productImageRepository : Repository<ProductImage>,


    private readonly dataSourece : DataSource
  ) {}

  async create(createProductDto: CreateProductDto, user : User) {

    try {

      const {images = [], ...productDetails} = createProductDto;
      


      const product = this.productRepository.create({
        ...productDetails,
        images : images.map(images => this.productImageRepository.create({url: images})),
        user
      });
      await this.productRepository.save(product);
      return {...product, images} ;

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;

    const products =  await this.productRepository.find({
      take: limit,
      skip: offset,
      relations : {
        images : true
      }
    });

    return products.map(product => ({
      ...product,
      images : product?.images?.map(image => image.url)
    }))
  }

  async findOne(term: string) {

    let product : Product;
    
    if(IsUUID(term)){
      product = await this.productRepository.findOneBy({id: term}) as Product;
    }else{
      // product = await this.productRepository.findOne({where: {slug: term}}) as Product;

      const queryBuilder = this.productRepository.createQueryBuilder('prod');

      product = await queryBuilder.where('UPPER(title) = :title or slug =:slug', {title: term.toUpperCase(), slug: term.toLowerCase()})
                                  .leftJoinAndSelect('prod.images', 'productImage')
                                  .getOne() as Product;

    }

    // const product = await this.productRepository.findOne({where: {id: term, }});

    if(!product ){
      throw new NotFoundException(`Product with id ${term} not found`);
    }

    return product
  }

  async findOnePlain(term : string) {
    const {images = [], ...rest} = await this.findOne(term);
    return {...rest, images : images?.map(image => image.url)}
  }

  async update(id: string, updateProductDto: UpdateProductDto,  user : User) {

    const {images, ...toUpdate} = updateProductDto;

    const product = await this.productRepository.preload({id, ...toUpdate})

    if(!product)throw new NotFoundException(`Product with id ${id} not found`);
    
    const queryRunner = this.dataSourece.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if(images){
        await queryRunner.manager.delete(ProductImage, {product: {id}});

        product.images = images.map(
          images => this.productImageRepository.create({url: images})
        )
      }

      product.user = user;

      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction()
      await queryRunner.release()
      // await this.productRepository.save(product);
      return this.findOnePlain(id);
      
    } catch (error) {
      
      await queryRunner.rollbackTransaction()
      await queryRunner.release()

      this.handleDBExceptions(error);
    }


  }

  async remove(id: string) {

    const product = await this.findOne(id);

    return await this.productRepository.remove(product);
  }

  private handleDBExceptions(error : any){

    if(error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('unexpected error check server logs');
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
        return await query.delete()
                          .where({})
                          .execute();
    } catch (error) {
      this.handleDBExceptions(error)
    }

  }

}


