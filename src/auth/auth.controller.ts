import { Controller, Get, Post, Body, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { GetRawHeaders } from './decorators/get-rawHeaders.decorator';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles.interface';
import { Auth } from './decorators/auth.decorator';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() CreateUserDto: CreateUserDto) {
    return this.authService.create(CreateUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  chechAuthStatus(

    @GetUser() user : User

  ){

    return this.authService.checkAuthStatus(user);

    
  }
  
  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @Req() req : Express.Request,
    @GetUser() user : User,
    @GetUser('email') email : string ,
    @GetRawHeaders() rawHeaders : string[]
  ){

    

    return {
      ok : true,
      message : 'Private route',
      user,
      email,
      rawHeaders
    }
  }

  @Get('private2')
  // @SetMetadata('roles', ['admin', 'super-user'])
  @RoleProtected(ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(
    @GetUser() user : User,
  ){

    return user

  }

  @Get('private3')
  @Auth(ValidRoles.user)
  privateRoute3(){


    return {
      ok : true,
      message : 'Private route3'
    }
  }

}
