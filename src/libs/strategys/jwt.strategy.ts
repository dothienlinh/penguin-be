import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from '@apis/users/users.service';
import { ConfigService } from '@nestjs/config';
import { Payload } from '@libs/interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('ACCESS_SECRET_JWT'),
    });
  }

  async validate(payload: Payload) {
    const user = await this.usersService.getProfileUser(payload.sub);
    return user;
  }
}
