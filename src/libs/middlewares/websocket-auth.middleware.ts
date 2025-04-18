import { UsersService } from '@apis/users/users.service';
import { Payload } from '@libs/interfaces';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

export const WebSocketAuthMiddleware = (
  jwtService: JwtService,
  configService: ConfigService,
  userService: UsersService,
  logger: Logger,
) => {
  return async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake?.auth?.token;

      if (!token) {
        throw new UnauthorizedException('Authorization token is missing');
      }

      let payload: Payload | null = null;

      try {
        payload = await jwtService.verifyAsync<Payload>(token, {
          secret: configService.getOrThrow<string>('ACCESS_SECRET_JWT'),
        });
      } catch (error) {
        logger.error(error);
        throw new UnauthorizedException('Authorization token is invalid');
      }

      const user = await userService.getProfileUser(payload);

      if (!user) {
        throw new UnauthorizedException('User does not exist');
      }

      socket.data.user = user;
      next();
    } catch (error) {
      logger.error(error);
      next(new UnauthorizedException('Unauthorized'));
    }
  };
};
