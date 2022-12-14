import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'

import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';


@Injectable()
export class AuthService {

   constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,

      private readonly jwtService: JwtService

   ) { }

   async create(createUserDto: CreateUserDto) {
      try {
         const { password, ...userData } = createUserDto;
         const user = this.userRepository.create({
            ...userData,
            password: bcrypt.hashSync(password, 10)
         });
         await this.userRepository.save(user);
         delete user.password;

         return { ...user, token: this.getJwtPayload({ email: user.email }) };
      } catch (error) {
         this.handleDbError(error);
      }
   }

   async login(loginUserDto: LoginUserDto) {
      const { password, email } = loginUserDto;
      const user = await this.userRepository.findOne({
         where: { email },
         select: { email: true, password: true }
      });

      if (!user)
         throw new UnauthorizedException(`Credentials are not valid (email)`);

      if (!bcrypt.compareSync(password, user.password))
         throw new UnauthorizedException(`Credentials are not valid (email)`);

      return { ...user, token: this.getJwtPayload({ email: user.email }) };
   }

   private getJwtPayload(payload: JwtPayload) {
      const token = this.jwtService.sign(payload);
      return token;
   }

   private handleDbError(error: any): never {
      if (error.code === '23505')
         throw new BadRequestException(error.detail);
      console.log(error);
      throw new InternalServerErrorException(`An error ocurred, please check server log`);
   }

}
