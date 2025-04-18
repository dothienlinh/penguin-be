import { CreateUserFacebookDto } from '@apis/users/dto/create-user-facebook.dto';
import { CreateUserGoogleDto } from '@apis/users/dto/create-user-google.dto';
import { SignupDto } from '@apis/users/dto/signup.dto';
import { User } from '@apis/users/entities/user.entity';
import { UsersService } from '@apis/users/users.service';
import { BaseService } from '@libs/base/base.service';
import { RedisService } from '@libs/configs/redis/redis.service';
import { RedisKey, Roles } from '@libs/enums';
import { Payload } from '@libs/interfaces';
import { generateOtpCode } from '@libs/utils/otpCode.utils';
import { comparePassword } from '@libs/utils/password.utils';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import ms, { StringValue } from 'ms';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService extends BaseService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    super(AuthService.name);
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.usersService.findOneByFields({
        key: 'email',
        value: email,
      });

      if (!user) {
        throw new BadRequestException('Email or password is incorrect');
      }

      const isMatch = await comparePassword(password, user.password);
      return isMatch ? plainToInstance(User, user) : null;
    } catch (error) {
      this.handleError(error, 'Validate user failed');
    }
  }

  async login(user: User, response: Response, isVerified?: boolean) {
    try {
      const sessionId = uuidv4();
      const payload: Payload = { sub: user.id, sessionId };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload),
        this.createRefreshToken(payload),
        ...(isVerified ? [this.usersService.verifyUser(user.id)] : []),
      ]);

      await Promise.all([
        this.redisService.set({
          key: `${RedisKey.SESSION_ID}:${user.id}`,
          value: sessionId,
          expired: ms(
            this.configService.getOrThrow<StringValue>('REFRESH_EXPIRES_IN'),
          ),
        }),
        this.redisService.set({
          key: `${RedisKey.REFRESH_TOKEN}:${user.id}`,
          value: refreshToken,
          expired: ms(
            this.configService.getOrThrow<StringValue>('REFRESH_EXPIRES_IN'),
          ),
        }),
      ]);

      response.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: ms(
          this.configService.getOrThrow<StringValue>('REFRESH_EXPIRES_IN'),
        ),
      });

      return { accessToken };
    } catch (error) {
      this.handleError(error, 'Login failed');
    }
  }

  async googleLoginCallback(user: User, res: Response) {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    // const nodeEnv = this.configService.getOrThrow<string>('NODE_ENV');

    if (!user) {
      return res.redirect(frontendUrl);
    }

    try {
      // const { accessToken } =
      await this.login(user, res, true);

      const pathname = user?.role?.name === Roles.USER ? '/' : '/admin';
      res.redirect(`${frontendUrl}${pathname}`);

      // if (nodeEnv !== 'development') {
      //   const pathname = user?.role?.name === Roles.USER ? '/' : '/admin';
      //   res.redirect(`${frontendUrl}${pathname}`);
      // } else {
      //   return { accessToken };
      // }
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

  async signup(signupDto: SignupDto) {
    try {
      const { otpCode, email, username } = signupDto;
      const user = await this.usersService.findOneByFields({
        key: 'username',
        value: username,
      });

      if (user) {
        throw new BadRequestException('Username already exists');
      }

      const otpCodeRedis = await this.redisService.get(
        `${RedisKey.OTP_REGISTER}:${email}`,
      );

      if (otpCode !== otpCodeRedis) {
        throw new BadRequestException('Invalid OTP code');
      }

      await this.redisService.del(`${RedisKey.OTP_REGISTER}:${email}`);

      return await this.usersService.create(signupDto);
    } catch (error) {
      this.handleError(error, 'Signup failed');
    }
  }

  async logout(id: number, response: Response) {
    await this.redisService.del(`${RedisKey.REFRESH_TOKEN}:${id}`);
    response.clearCookie('refreshToken');
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded: Payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('REFRESH_SECRET_JWT'),
      });

      const payload: Payload = {
        sub: decoded.sub,
        sessionId: decoded.sessionId,
      };

      const sessionIdRedis = await this.redisService.get(
        `${RedisKey.SESSION_ID}:${decoded.sub}`,
      );

      if (decoded.sessionId !== sessionIdRedis) {
        throw new BadRequestException('Invalid session');
      }

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
  ) {
    const key = socialPlatform === 'facebook' ? 'facebookId' : 'googleId';
    const user = await this.usersService.findOneByFields(
      {
        key,
        value: profile[key],
      },
      ['role'],
    );

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

      const otpCode = generateOtpCode();
      await this.redisService.set({
        key: `${RedisKey.OTP_REGISTER}:${email}`,
        value: otpCode.toString(),
        expired: ms(
          this.configService.getOrThrow<StringValue>('OTP_REGISTER_EXPIRES_IN'),
        ),
      });

      return otpCode;
    } catch (error) {
      this.handleError(error, 'Send OTP code register failed');
    }
  }
}
