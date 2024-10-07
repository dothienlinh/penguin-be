import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { VerifyOtpCodeDto } from './dto/verify-otp-code.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@libs/decorators/user.decorator';
import { User } from '@apis/users/entities/user.entity';
import { RedisKey } from '@libs/enums';
import { Public } from '@libs/decorators/public.decorator';
import { SendForgotPasswordDto } from './dto/send-forgot-password.dto';
import { ResponseMessage } from '@libs/decorators/responseMessage.decorator';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-otp-code-verification')
  @ApiOperation({ summary: 'Send OTP code verification' })
  async sendOTPCodeVerification(@CurrentUser() user: User) {
    return await this.mailService.sendOTPCode(
      user.email,
      RedisKey.OTP_VERIFICATION,
    );
  }

  @Post('verify-otp-code-verification')
  @ApiOperation({ summary: 'Verify OTP code verification' })
  async verifyOTPCodeVerification(
    @Body() verifyOTPCode: VerifyOtpCodeDto,
    @CurrentUser() user: User,
  ) {
    return await this.mailService.verifyOtpCode(
      verifyOTPCode,
      user.id,
      user.email,
      RedisKey.OTP_VERIFICATION,
    );
  }

  @Public()
  @Post('send-forgot-password')
  @ApiOperation({ summary: 'Send forgot password email' })
  async sendForgotPassword(
    @Body() sendForgotPasswordDto: SendForgotPasswordDto,
  ) {
    return await this.mailService.sendForgotPassword(sendForgotPasswordDto);
  }

  @Post('send-reset-password')
  @ApiOperation({ summary: 'Send reset password email' })
  async sendResetPasswordSuccess(@CurrentUser() user: User) {
    return await this.mailService.sendOTPCode(
      user.email,
      RedisKey.RESET_PASSWORD,
    );
  }
}
