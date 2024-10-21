import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
  handleRequest(err, user, info, context) {
    const req = context.switchToHttp().getRequest();
    const query = req.query;

    if (query.error === 'access_denied') {
      return null;
    }

    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    return user;
  }
}
