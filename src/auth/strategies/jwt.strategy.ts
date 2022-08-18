import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";

import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { Repository } from 'typeorm';
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

   constructor(
      @InjectRepository(User)
      private readonly useRepository: Repository<User>,

      configServide: ConfigService
   ) {
      super({
         secretOrKey: configServide.get('JWT_SECRET'),
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      });
   }

   async validate(payload: JwtPayload): Promise<User> {

      const { email } = payload;
      const user = await this.useRepository.findOneBy({ email });

      if (!user)
         throw new UnauthorizedException(`Token si invalid`);

      if (!user.isActive)
         throw new UnauthorizedException(`User is inactive, talk with admin`);

      return user;
   }

}