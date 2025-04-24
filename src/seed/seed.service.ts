import { Inject, Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';
import { Product } from 'src/products/entities';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';


@Injectable()
export class SeedService {

  constructor(
    private readonly productsService : ProductsService,

    @InjectRepository(User)
    private readonly userRepository : Repository<User>
  ) {}

  async runSeed() {

    await this.deleteTables();
    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser);

    return 'seed executed'
  }


  private async deleteTables() {

    await this.productsService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete()
                      .where({})
                      .execute();

  }

  private async insertUsers() {
    const seedUsers = initialData.users;

    const users : User[] = []

    seedUsers.forEach(user => { 
      const {password : rawPassword, ...restUser} = user;
      users.push(this.userRepository.create({
        password : bcrypt.hashSync(rawPassword, 10),
        ...restUser
      }))
    })
    
    const dbUsers = await this.userRepository.save(users);

    return dbUsers[0];
  }

  private async insertNewProducts(user : User) {

    await this.productsService.deleteAllProducts();

    const product = initialData.products;

    // const insertPromises : Promise<CreateProductDto>[] = product.map(product => {
    //   return this.productsService.create(product) as Promise<CreateProductDto>
    // })

    const insertPromises = product.map(product => {
      return this.productsService.create(product, user) 
    })

    await Promise.all(insertPromises);

    return true

  }

}
