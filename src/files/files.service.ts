import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {

    getStaticProductImage(imagesName: string){

        const path = join(__dirname, '../../static/products', imagesName)

        if(!existsSync(path)) throw new BadRequestException(`No product found with image ${imagesName}`)

    
        return path
    }
}
