import { BadRequestException } from "@nestjs/common";
import { Console } from "console";


export const fileFilter = (req : Express.Request, file : Express.Multer.File, callback : Function) => {


    if(!file) return callback(new Error('File is empty'), false)

    
    const fileExtension = file.originalname.split('.')[1];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if(!allowedExtensions.includes(fileExtension)){
        return callback(new BadRequestException('File extension not allowed'), false)
    }


    callback(null, true)
}