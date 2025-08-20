import { Body, Controller, Delete, HttpCode, HttpStatus, Post } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { CustomLogger, CustomLoggerWithContext } from 'src/infrastructure/logger/logger.service'
import { Authorization, Authorized, BearerToken, ClientIp, UserAgent } from 'src/security/decorators'
import { AuthResponse, LoginRequest, RegisterRequest } from '../dto'
import { AuthService } from '../services'


@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger: CustomLoggerWithContext

  constructor(
    private readonly customLogger: CustomLogger,
    private readonly authService: AuthService
  ) {
    this.logger = this.customLogger.withContext(AuthController.name)
  }

  @ApiOperation({
    summary: 'User Registration',
    description: 'Register a new user account'
  })
  @ApiOkResponse({
    type: AuthResponse,
    description: 'User successfully registered'
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data'
  })
  @ApiConflictResponse({
    description: 'User already exists'
  })
  // @Throttle(3, 300)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterRequest,
    @ClientIp() ipAddress: string,
    @UserAgent() userAgent: string
  ): Promise<AuthResponse> {
    this.logger.info('Registering new user', { email: registerDto.email, phone: registerDto.phone })
    const user = await this.authService.register(registerDto)

    this.logger.info('Login after registration', { userId: user.userId, ipAddress, userAgent })
    return await this.authService.login({ ...registerDto }, { ipAddress, userAgent })
  }

  @ApiOperation({
    summary: 'User Login',
    description: 'Authenticate user and get access token'
  })
  @ApiOkResponse({
    type: AuthResponse,
    description: 'User successfully logged in'
  })
  @ApiBadRequestResponse({
    description: 'Invalid credentials'
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized'
  })
  // @Throttle(5, 60)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginRequest,
    @ClientIp() ipAddress: string,
    @UserAgent() userAgent: string
  ): Promise<AuthResponse> {
    this.logger.info(`Login attempt from IP: ${ipAddress}`)
    return await this.authService.login(loginDto, { ipAddress, userAgent })
  }

  @ApiOperation({
    summary: 'User Logout',
    description: 'Invalidates the user\'s refresh token and clears authentication state'
  })
  @ApiNoContentResponse({
    description: 'Successfully logged out'
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - valid access token required'
  })
  @Delete('logout')
  @Authorization()
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Authorized('userId') userId: string,
    @BearerToken() token: string
  ): Promise<void> {
    this.logger.info(`User ${userId} logging out`)
    await this.authService.logout(userId, token)
    return
  }

  @ApiOperation({
    summary: 'Refresh Token',
    description: 'Get new access token using refresh token'
  })
  @ApiOkResponse({
    type: AuthResponse,
    description: 'Token successfully refreshed'
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token'
  })
  @Post('refresh')
  @Authorization()
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Authorized('userId') userId: string,
    @BearerToken() token: string,
    @ClientIp() ipAddress: string,
    @UserAgent() userAgent: string
  ): Promise<AuthResponse> {
    this.logger.info(`User ${userId} refreshing token`)
    return await this.authService.refresh(userId, token, { ipAddress, userAgent })
  }
}
