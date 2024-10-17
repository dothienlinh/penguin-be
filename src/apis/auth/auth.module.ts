import { UsersModule } from '@apis/users/users.module';
import { RedisModule } from '@libs/configs/redis/redis.module';
import { JwtStrategy } from '@libs/strategys/jwt.strategy';
import { LocalStrategy } from '@libs/strategys/local.strategy';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FacebookStrategy } from '@libs/strategys/facebook.strategy';
import { GoogleStrategy } from '@libs/strategys/google.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('ACCESS_SECRET_JWT'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>('ACCESS_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    FacebookStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
