import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { diskStorage } from 'multer';
import { fileNamer, fileFilter } from './helpers';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';



@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly confingService : ConfigService
  ) {}

  @Get('product/:imagesName')
  findProductImage(
    @Res() res : Response,
    @Param('imagesName') imagesName: string
  ){
    
    const path = this.filesService.getStaticProductImage(imagesName)

    res.sendFile(path);

  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file',{
    fileFilter : fileFilter,
    // limits : {fi}
    storage: diskStorage({
      destination: './static/products',
      filename : fileNamer
    })
  }))
  uploadProductImage( 
    @UploadedFile() file: Express.Multer.File
  ) {

    // const secureUrl =`${file.filename}`

    if(!file) throw new BadRequestException('Make sure that the file is  an image')
      

    const secureUrl = `${this.confingService.get('HOST_API')}/files/product/${file.filename}`



    return {secureUrl}
  }

}
