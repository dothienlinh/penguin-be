import { UsersService } from '@apis/users/users.service';
import { Payload } from '@libs/interfaces';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
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
        throw new WsException('Authorization token is missing');
      }

      let payload: Payload | null = null;

      try {
        payload = await jwtService.verifyAsync<Payload>(token, {
          secret: configService.getOrThrow<string>('ACCESS_SECRET_JWT'),
        });
      } catch (error) {
        logger.error(error);
        throw new WsException('Authorization token is invalid');
      }

      const user = await userService.getProfileUser(payload);

      if (!user) {
        throw new WsException('User does not exist');
      }

      socket.data.user = user;
      next();
    } catch (error) {
      logger.error(error);
      next(new Error('Unauthorized'));
    }
  };
};
