import { AuthService } from '@apis/auth/auth.service';
import { RolesService } from '@apis/roles/roles.service';
import { Provider, Roles } from '@libs/enums';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly rolesService: RolesService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${configService.getOrThrow<string>('BACKEND_URL')}/api/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { name, emails, photos, id } = profile;
    const role = await this.rolesService.findOneByName(Roles.USER);
    const user = await this.authService.validateGoogleUser({
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      googleId: id,
      avatar: photos[0].value,
      provider: Provider.GOOGLE,
      roleId: role.id,
    });
    done(null, user);
  }
}
