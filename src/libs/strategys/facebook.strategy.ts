import { AuthService } from '@apis/auth/auth.service';
import { RolesService } from '@apis/roles/roles.service';
import { Gender, Provider, Roles } from '@libs/enums';
import { toLowerCaseNonAccentVietnamese } from '@libs/utils/converts-string.util';
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
      scope: ['email', 'public_profile'],
      profileFields: ['emails', 'name', 'id', 'photos'],
      proxy: true,
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ) {
    const {
      name: { familyName, givenName, middleName },
      id,
      gender,
      username: displayName,
    } = profile;

    const username = displayName
      ? toLowerCaseNonAccentVietnamese(displayName) + '_' + id
      : toLowerCaseNonAccentVietnamese(givenName) +
        '_' +
        (middleName ? toLowerCaseNonAccentVietnamese(middleName) + '_' : '') +
        toLowerCaseNonAccentVietnamese(familyName) +
        '_' +
        id;

    const role = await this.rolesService.findOneByName(Roles.USER);

    const user = await this.authService.validateFacebookUser({
      username,
      facebookId: id,
      gender: gender in Gender ? (gender as Gender) : Gender.OTHER,
      provider: Provider.FACEBOOK,
      role: role,
    });

    done(null, user);
  }
}
