import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@apis/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '@libs/strategys/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '@libs/strategys/jwt.strategy';
import { FacebookStrategy } from '@libs/strategys/facebook.strategy';
import { GoogleStrategy } from '@libs/strategys/google.strategy';
import { RedisModule } from '@libs/configs/redis/redis.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
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
    RedisModule,
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
