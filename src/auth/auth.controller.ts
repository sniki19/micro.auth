import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { ApiBadRequestResponse, ApiConflictResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { PinoLogger } from 'nestjs-pino'
import { ClientIp, UserAgent } from 'src/common/decorators'
import { AuthGuardDemoTest } from 'src/common/guards'
import { AuthService } from './auth.service'
import { Authorization } from './decorators/authorization.decorator'
import { Authorized } from './decorators/authorized.decorator'
import { AuthResponse } from './dto/auth.res.dto'
import { LoginRequest } from './dto/login.dto'
import { RegisterRequest } from './dto/register.dto'


@Controller('auth')
export class AuthController {
  constructor(
    private readonly logger: PinoLogger,
    private authService: AuthService
  ) {
    this.logger.setContext(AuthController.name)
  }

  @ApiOperation({
    summary: 'Registration',
    description: 'Register a new user account'
  })
  @ApiOkResponse({ type: AuthResponse })
  @ApiBadRequestResponse({
    description: 'Некорректные входные данные'
  })
  @ApiConflictResponse({
    description: 'Пользователь уже существует'
  })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterRequest) {
    return await this.authService.register(dto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequest, @ClientIp() ipAddress: string, @UserAgent() userAgent: string) {
    return await this.authService.login(dto, { ipAddress, userAgent })
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh() {
    return await this.authService.refresh('')
  }

  @UseGuards(AuthGuardDemoTest)
  @Get('me')
  getProfile(@UserAgent() userAgent: string) {
    this.logger.info('me profile ,' + userAgent)
    return 'me profile ,' + userAgent
  }

  // @UseGuards(AuthGuard('jwt'))
  @Authorization()
  @Get('me2')
  @HttpCode(HttpStatus.OK)
  // async me2(@Req() req: Request) {
  //   return req.user
  // }
  async me2(@Authorized('userId') user: string) {
    return Promise.resolve(user)
  }

  // @Post('login')
  // async login(@Body() dto: LoginDto, @Ip() ip: string, @Headers('user-agent') userAgent: string) {
  //   return this.authService.login(dto, ip, userAgent);
  // }

  // @Post('refresh')
  // async refreshTokens(@Body('refreshToken') refreshToken: string, @Headers('fingerprint') fingerprint?: string) {
  //   return this.authService.refreshTokens(refreshToken, fingerprint);
  // }

  // @Post('logout')
  // @UseGuards(JwtAuthGuard)
  // async logout(@Req() req) {
  //   return this.authService.logout(req.user.sessionId);
  // }
}
