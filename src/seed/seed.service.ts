import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';
import { Product } from 'src/products/entities';
import { CreateProductDto } from 'src/products/dto/create-product.dto';


@Injectable()
export class SeedService {

  constructor(
    private readonly productsService : ProductsService
  ) {}

  async runSeed() {

    await this.insertNewProducts();

    return 'seed executed'
  }

  private async insertNewProducts() {

    await this.productsService.deleteAllProducts();

    const product = initialData.products;

    // const insertPromises : Promise<CreateProductDto>[] = product.map(product => {
    //   return this.productsService.create(product) as Promise<CreateProductDto>
    // })

    const insertPromises = product.map(product => {
      return this.productsService.create(product) 
    })

    await Promise.all(insertPromises);

    return true

  }

}
