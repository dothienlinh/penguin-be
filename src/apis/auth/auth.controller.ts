import { Public } from '@libs/decorators/public.decorator';
import { LocalAuthGuard } from '@libs/guards/local-auth.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ResponseMessage } from '@libs/decorators/responseMessage.decorator';
import { CurrentUser } from '@libs/decorators/user.decorator';
import { Request, Response } from 'express';
import { CreateUserDto } from '@apis/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '@apis/users/entities/user.entity';
import { FacebookAuthGuard } from '@libs/guards/facebook-auth.guard';
import { GoogleAuthGuard } from '@libs/guards/google-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Login' })
  @ResponseMessage('Login successful')
  async login(
    @CurrentUser() user,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response);
  }

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Signup' })
  @ResponseMessage('Signup successful')
  async signup(@Body() createUserDto: CreateUserDto) {
    return await this.authService.signup(createUserDto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout' })
  @ResponseMessage('Logout successful')
  async logout(@Res({ passthrough: true }) res: Response, @Req() req) {
    const { id }: { id: number } = req.user;
    return await this.authService.logout(id, res);
  }

  @Public()
  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh token' })
  @ResponseMessage('Refresh token successful')
  async refreshToken(@Req() request: Request) {
    const refreshToken: string = request.cookies['refreshToken'];
    return await this.authService.refreshToken(refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Forgot password' })
  @ResponseMessage('Forgot password successful')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ResponseMessage('Reset password successful')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @CurrentUser() user: User,
  ) {
    return await this.authService.resetPassword(resetPasswordDto, user);
  }

  @Public()
  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Facebook login' })
  @ResponseMessage('Facebook login successful')
  async facebookLogin() {
    return;
  }

  @Public()
  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Facebook login callback' })
  @ResponseMessage('Facebook login callback successful')
  async facebookLoginCallback(
    @CurrentUser() user,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.facebookLoginCallback(user, res);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google login' })
  @ResponseMessage('Google login successful')
  async googleLogin() {
    return;
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google login callback' })
  @ResponseMessage('Google login callback successful')
  async googleLoginCallback(
    @CurrentUser() user,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.googleLoginCallback(user, res);
  }

  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }
}
