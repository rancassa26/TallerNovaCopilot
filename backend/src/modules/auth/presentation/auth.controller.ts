import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { GlobalExceptionFilter } from '../../../common/filters/exception.filter';
import { CorrelationIdInterceptor } from '../../../common/interceptors/correlation-id.interceptor';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor';
import { CorrelationId, Public } from '../../../common/decorators/index';
import { AuthService } from '../application/auth.service';
import { LoginDto, LoginResponseDto } from './dtos/login.dto';
import { BaseResponseDTO } from '../../../common/dtos/base-response.dto';

/**
 * AuthController - Presentation layer for authentication
 */
@Controller('auth')
@UseFilters(GlobalExceptionFilter)
@UseInterceptors(CorrelationIdInterceptor, ResponseInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @CorrelationId() correlationId: string,
  ): Promise<BaseResponseDTO<LoginResponseDto>> {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
      correlationId,
    );

    return BaseResponseDTO.success(
      'Login successful',
      {
        token: result.token,
        user: {
          id: result.user.id,
          email: result.user.email,
          roles: result.user.roles,
        },
      },
      correlationId,
      200,
    );
  }
}
