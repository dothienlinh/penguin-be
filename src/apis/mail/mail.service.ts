import { AuthService } from '@apis/auth/auth.service';
import { UsersService } from '@apis/users/users.service';
import { BaseService } from '@libs/base/base.service';
import { RedisService } from '@libs/configs/redis/redis.service';
import { RedisKey } from '@libs/enums';
import { generateOtpCode } from '@libs/utils/otpCode.utils';
import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { SendForgotPasswordDto } from './dto/send-forgot-password.dto';
import { SendRegisterDto } from './dto/send-register-dto';
import { VerifyOtpCodeDto } from './dto/verify-otp-code.dto';
@Injectable()
export class MailService extends BaseService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly redisService: RedisService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super(MailService.name);
  }

  sendOTPCode = async (email: string, key: RedisKey) => {
    const otpCode = generateOtpCode();
    return await this.mailerService
      .sendMail({
        to: email,
        subject: 'Send OTP code',
        template: 'sendOTPCode',
        context: {
          otpCode,
        },
      })
      .then(async () => {
        await this.redisService.set({
          key: `${key}:${email}`,
          value: otpCode.toString(),
          expired: ms(
            this.configService.getOrThrow<StringValue>(
              'OTP_RESET_PASSWORD_EXPIRES_IN',
            ),
          ),
        });

        return true;
      })
      .catch((error) => {
        this.handleError(error, 'Send OTP code failed');
      });
  };

  verifyOtpCode = async (
    verifyOtpCodeDto: VerifyOtpCodeDto,
    userId: number,
    email: string,
    key: RedisKey,
  ) => {
    const { otpCode } = verifyOtpCodeDto;

    const record = await this.redisService.get(`${key}:${email}`);

    if (!record || otpCode !== record) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.redisService.del(`${key}:${email}`);
    await this.usersService.verifyUser(+userId);

    return true;
  };

  sendForgotPassword = async (sendForgotPasswordDto: SendForgotPasswordDto) => {
    try {
      const { email } = sendForgotPasswordDto;

      const user = await this.usersService.findOneByFields({
        key: 'email',
        value: email,
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const otpCode = generateOtpCode();

      return await this.mailerService
        .sendMail({
          to: email,
          subject: 'Forgot Password',
          template: 'sendForgotPassword',
          context: {
            otpCode,
          },
        })
        .then(async () => {
          await this.redisService.set({
            key: `${RedisKey.FORGOT_PASSWORD}:${email}`,
            value: otpCode,
            expired: ms(
              this.configService.getOrThrow<StringValue>(
                'OTP_FORGOT_PASSWORD_EXPIRES_IN',
              ),
            ),
          });

          return true;
        })
        .catch((error) => {
          this.handleError(error, 'Send forgot password failed');
        });
    } catch (error) {
      this.handleError(error, 'Send forgot password failed');
    }
  };

  sendOtpCodeRegister = async (sendRegisterDto: SendRegisterDto) => {
    try {
      const { email } = sendRegisterDto;
      const otpCode = await this.authService.sendOtpCodeRegister(email);

      return await this.mailerService
        .sendMail({
          to: email,
          subject: 'OTP Code Register',
          template: 'sendOTPCodeRegister',
          context: {
            otpCode,
          },
        })
        .then(async () => {
          return true;
        })
        .catch((error) => {
          this.handleError(error, 'Send forgot password failed');
        });
    } catch (error) {
      this.handleError(error, 'Send OTP code register failed');
    }
  };
}
