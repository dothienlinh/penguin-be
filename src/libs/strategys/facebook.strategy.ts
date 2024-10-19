import { AuthService } from '@apis/auth/auth.service';
import { RolesService } from '@apis/roles/roles.service';
import { Gender, Provider, Roles } from '@libs/enums';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly rolesService: RolesService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('FACEBOOK_APP_ID'),
      clientSecret: configService.getOrThrow<string>('FACEBOOK_APP_SECRET'),
      callbackURL: `${configService.getOrThrow<string>('BACKEND_URL')}/api/auth/facebook/callback`,
      scope: 'email',
      profileFields: ['emails', 'name'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ) {
    const { name, id, gender } = profile;

    const role = await this.rolesService.findOneByName(Roles.USER);

    const user = await this.authService.validateFacebookUser({
      firstName: name.givenName,
      lastName: name.familyName,
      facebookId: id,
      gender: gender in Gender ? (gender as Gender) : Gender.OTHER,
      provider: Provider.FACEBOOK,
      roleId: role.id,
    });

    done(null, user);
  }
}
