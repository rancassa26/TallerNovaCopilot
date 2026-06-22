import { Controller, Get, Query, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AuditUseCase } from '../application/audit.use-case';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../infrastructure/guards/roles.guard';
import { Roles } from '../infrastructure/decorators/roles.decorator';
import { UserRole } from '../../domain/auth.enum';

/**
 * AuditController - Capa de Presentación
 * Expone endpoints para la consulta de trazabilidad y logs de auditoría.
 */
@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // Solo administradores pueden consultar auditoría
@Controller('auth/audit')
export class AuditController {
  constructor(private readonly auditUseCase: AuditUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los logs de auditoría con paginación' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Lista paginada de logs devuelta con éxito.' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.auditUseCase.findAll(page, limit);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Filtrar logs de auditoría por ID de usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario a consultar' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Logs del usuario filtrados con éxito.' })
  async findByUser(
    @Param('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.auditUseCase.findByUser(userId, page, limit);
  }

  @Get('correlation/:correlationId')
  @ApiOperation({ summary: 'Filtrar logs por Correlation ID (Trazabilidad Técnica)' })
  @ApiParam({ name: 'correlationId', description: 'UUID de correlación de la transacción' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Trazabilidad de la petición recuperada.' })
  async findByCorrelationId(
    @Param('correlationId') correlationId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.auditUseCase.findByCorrelationId(correlationId, page, limit);
  }
}