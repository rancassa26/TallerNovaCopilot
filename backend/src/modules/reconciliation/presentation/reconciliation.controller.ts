import { Controller, Post, Body, UseGuards, UseInterceptors, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { LoadReconciliationUseCase } from '../application/load-reconciliation.use-case';
import { ValidateReconciliationUseCase } from '../application/validate-reconciliation.use-case';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../auth/domain/auth.enum';
import { CorrelationIdInterceptor } from '../../../common/interceptors/correlation-id.interceptor';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor';
import { CorrelationId } from '../../../common/decorators/index';
import { BaseResponseDTO } from '../../../common/dtos/base-response.dto';
import { ValidateReconciliationDto } from './dtos/validate-reconciliation.dto';

@ApiTags('Reconciliation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(CorrelationIdInterceptor, ResponseInterceptor)
@Controller('reconciliation')
export class ReconciliationController {
  constructor(
    private readonly loadUseCase: LoadReconciliationUseCase,
    private readonly validateUseCase: ValidateReconciliationUseCase,
  ) {}

  /**
   * Endpoint para cargar y validar un nuevo proceso de conciliación.
   */
  @Post('load')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN) // Solo administradores pueden cargar nuevas conciliaciones
  @ApiOperation({ summary: 'Cargar un nuevo archivo de conciliación JSON' })
  @ApiHeader({ name: 'X-Correlation-Id', description: 'ID de correlación para trazabilidad técnica' })
  @ApiResponse({ status: 201, description: 'Conciliación cargada, validada y auditada con éxito.' })
  @ApiResponse({ status: 400, description: 'Error en la estructura del JSON o datos inválidos.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado (Solo ADMIN).' })
  async load(
    @Body() data: any,
    @Request() req: any,
    @CorrelationId() correlationId: string,
  ): Promise<BaseResponseDTO<any>> {
    // Extraemos el sub (ID de usuario) del token JWT decodificado por el Guard
    const userId = req.user.sub;

    const result = await this.loadUseCase.execute(data, userId, correlationId);

    return BaseResponseDTO.success(
      'Reconciliation loaded and validated successfully',
      result,
      correlationId,
      201,
    );
  }

  /**
   * Endpoint para ejecutar la validación de una conciliación ya cargada.
   */
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Validar una conciliación y generar incidentes' })
  @ApiResponse({ status: 200, description: 'Validación ejecutada con éxito.' })
  async validate(
    @Body() dto: ValidateReconciliationDto,
    @Request() req: any,
    @CorrelationId() correlationId: string,
  ): Promise<BaseResponseDTO<any>> {
    const userId = req.user.sub;
    const result = await this.validateUseCase.execute(dto.reconciliationId, userId, correlationId);

    return BaseResponseDTO.success(
      'Validation process completed',
      result,
      correlationId,
    );
  }
}