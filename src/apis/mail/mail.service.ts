import { AuthService } from '@apis/auth/auth.service';
import { UsersService } from '@apis/users/users.service';
import { RedisService } from '@libs/configs/redis/redis.service';
import { RedisKey } from '@libs/enums';
import { ErrorHandler } from '@libs/utils/error-handler';
import { generateOtpCode } from '@libs/utils/otpCode';
import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { SendForgotPasswordDto } from './dto/send-forgot-password.dto';
import { SendRegisterDto } from './dto/send-register-dto';
import { VerifyOtpCodeDto } from './dto/verify-otp-code.dto';
@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly redisService: RedisService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  private readonly logger = new Logger(MailService.name);

  private handleError(error: any, message: string): never {
    this.logger.error(`${message}: ${error.message}`);
    return ErrorHandler.handle(error, message);
  }

  sendOTPCode = async (email: string, key: RedisKey) => {
    const isExistOtpCode = await this.redisService.get(`${key}:${email}`);

    if (isExistOtpCode) {
      await this.redisService.del(`${key}:${email}`);
    }

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
          expired: 60 * 5,
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

      const isExistOtpCode = await this.redisService.get(
        `${RedisKey.FORGOT_PASSWORD}:${email}`,
      );

      if (isExistOtpCode) {
        await this.redisService.del(`${RedisKey.FORGOT_PASSWORD}:${email}`);
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
              this.configService.getOrThrow<string>(
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
