import { CreateUserDto } from '@apis/users/dto/create-user.dto';
import { User } from '@apis/users/entities/user.entity';
import { UsersService } from '@apis/users/users.service';
import { RedisService } from '@libs/configs/redis/redis.service';
import { RedisKey } from '@libs/enums';
import { Payload } from '@libs/interfaces';
import { ErrorHandler } from '@libs/utils/error-handler';
import { comparePassword } from '@libs/utils/passwordUtils';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import ms from 'ms';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateUserFacebookDto } from '@apis/users/dto/create-user-facebook.dto';
import { CreateUserGoogleDto } from '@apis/users/dto/create-user-google.dto';
import { generateOtpCode } from '@libs/utils/otpCode';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  private handleError(error: any, message: string): never {
    this.logger.error(`${message}: ${error.message}`);
    return ErrorHandler.handle(error, message);
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.usersService.findOneByFields({
        key: 'email',
        value: email,
      });
      const isMatch = await comparePassword(password, user.password);
      return isMatch ? plainToInstance(User, user) : null;
    } catch (error) {
      this.handleError(error, 'Validate user failed');
    }
  }

  async login(user: User, response: Response, isVerified?: boolean) {
    try {
      const payload: Payload = { sub: user.id };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload),
        this.createRefreshToken(payload),
        ...(isVerified ? [this.usersService.verifyUser(user.id)] : []),
      ]);

      await this.usersService.updateRefreshToken(+user.id, refreshToken);

      response.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: ms(this.configService.getOrThrow<string>('REFRESH_SECRET_JWT')),
      });

      return { accessToken };
    } catch (error) {
      this.handleError(error, 'Login failed');
    }
  }

  async googleLoginCallback(user: User, res: Response) {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const nodeEnv = this.configService.getOrThrow<string>('NODE_ENV');

    if (!user) {
      return res.redirect(frontendUrl);
    }

    try {
      const { accessToken } = await this.login(user, res, true);

      if (nodeEnv !== 'development') {
        res.redirect(frontendUrl);
      } else {
        return { accessToken };
      }
    } catch (error) {
      this.handleError(error, 'Login callback failed');
    }
  }

  async facebookLoginCallback(user: User, res: Response) {
    return await this.googleLoginCallback(user, res);
  }

  async createRefreshToken(payload: Payload) {
    try {
      return await this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('REFRESH_SECRET_JWT'),
        expiresIn: this.configService.getOrThrow<string>('REFRESH_EXPIRES_IN'),
      });
    } catch (error) {
      this.handleError(error, 'Create refresh token failed');
    }
  }

  async signup(createUserDto: CreateUserDto) {
    const { otpCode, email } = createUserDto;
    const isExistOtpCode = await this.redisService.get(
      `${RedisKey.OTP_REGISTER}:${email}`,
    );

    if (otpCode !== isExistOtpCode) {
      throw new BadRequestException('Invalid OTP code');
    }

    return await this.usersService.create(createUserDto);
  }

  async logout(id: number, response: Response) {
    await this.usersService.updateRefreshToken(id, null);
    response.clearCookie('refreshToken');
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded: Payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('REFRESH_SECRET_JWT'),
      });

      const payload: Payload = { sub: decoded.sub };

      const accessToken = await this.jwtService.signAsync(payload);

      return { accessToken };
    } catch (error) {
      this.handleError(error, 'Refresh token failed');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const { password, otpCode, email } = forgotPasswordDto;
      const otpCodeRedis = await this.redisService.get(
        `${RedisKey.FORGOT_PASSWORD}:${email}`,
      );

      if (+otpCode !== +otpCodeRedis) {
        throw new BadRequestException('Invalid OTP code');
      }

      const [user] = await Promise.all([
        this.usersService.findOneByFields({
          key: 'email',
          value: email,
        }),
        this.redisService.del(`${RedisKey.FORGOT_PASSWORD}:${email}`),
      ]);

      return await this.usersService.updatePassword(user, password);
    } catch (error) {
      this.handleError(error, 'Forgot password failed');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, user: User) {
    try {
      const { password, otpCode } = resetPasswordDto;

      const otpCodeRedis = await this.redisService.get(
        `${RedisKey.RESET_PASSWORD}:${user.email}`,
      );

      if (otpCode !== otpCodeRedis) {
        throw new BadRequestException('Invalid OTP code');
      }

      await this.redisService.del(`${RedisKey.RESET_PASSWORD}:${user.email}`);

      return await this.usersService.updatePassword(user, password);
    } catch (error) {
      this.handleError(error, 'Reset password failed');
    }
  }

  private async findOrCreateUser(
    profile: CreateUserFacebookDto | CreateUserGoogleDto,
    socialPlatform: 'facebook' | 'google',
  ): Promise<User> {
    const key = socialPlatform === 'facebook' ? 'facebookId' : 'googleId';
    const user = await this.usersService.findOneByFields({
      key,
      value: profile[key],
    });

    if (user) {
      return plainToInstance(User, user);
    }

    const createdUser = await (socialPlatform === 'facebook'
      ? this.usersService.createWithFacebook(profile as CreateUserFacebookDto)
      : this.usersService.createWithGoogle(profile as CreateUserGoogleDto));

    return plainToInstance(User, createdUser);
  }

  async validateFacebookUser(profile: CreateUserFacebookDto) {
    try {
      return await this.findOrCreateUser(profile, 'facebook');
    } catch (error) {
      this.handleError(error, 'Validate facebook user failed');
    }
  }

  async validateGoogleUser(profile: CreateUserGoogleDto) {
    try {
      return await this.findOrCreateUser(profile, 'google');
    } catch (error) {
      this.handleError(error, 'Validate google user failed');
    }
  }

  async sendOtpCodeRegister(email: string) {
    try {
      const user = await this.usersService.findOneByFields({
        key: 'email',
        value: email,
      });

      if (user) {
        throw new BadRequestException('User already exists');
      }
      const isExistOtpCode = await this.redisService.get(
        `${RedisKey.OTP_REGISTER}:${email}`,
      );

      if (isExistOtpCode) {
        await this.redisService.del(`${RedisKey.OTP_REGISTER}:${email}`);
      }

      const otpCode = generateOtpCode();
      await this.redisService.set({
        key: `${RedisKey.OTP_REGISTER}:${email}`,
        value: otpCode.toString(),
        expired: ms(
          this.configService.getOrThrow<string>('OTP_REGISTER_EXPIRES_IN'),
        ),
      });

      return otpCode;
    } catch (error) {
      this.handleError(error, 'Send OTP code register failed');
    }
  }
}
