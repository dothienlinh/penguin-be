import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  handleRequest(err, user, info, context) {
    const req = context.switchToHttp().getRequest();
    const query = req.query;

    if (query.error === 'access_denied') {
      return null;
    }

    if (err) {
      console.error('Google auth error:', err);
      throw err;
    }

    if (!user) {
      throw new UnauthorizedException('Authentication failed');
    }

    return user;
  }
}
