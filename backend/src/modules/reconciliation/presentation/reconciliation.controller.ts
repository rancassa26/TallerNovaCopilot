import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CorrelationIdInterceptor } from '../../../common/interceptors/correlation-id.interceptor';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor';
import { CorrelationId, Roles } from '../../../common/decorators/index';
import { LoadReconciliationUseCase } from '../application/load-reconciliation.use-case';
import { ValidateReconciliationUseCase } from '../application/validate-reconciliation.use-case';
import { SearchAccountsUseCase } from '../application/search-accounts.use-case';
import { GetAccountDetailUseCase } from '../application/get-account-detail.use-case';
import { GetDashboardUseCase } from '../application/get-dashboard.use-case';
import { GetIncidentsUseCase } from '../application/get-incidents.use-case';
import { ExportResultsUseCase } from '../application/export-results.use-case';
import { ResolveIncidentUseCase } from '../application/resolve-incident.use-case';
import { LoadReconciliationDto } from './dtos/load-reconciliation.dto';
import { ValidateReconciliationDto } from './dtos/validate-reconciliation.dto';
import { ExportResultsDto } from './dtos/export-results.dto';
import { ResolveIncidentDto } from './dtos/resolve-incident.dto';
import { BaseResponseDTO } from '../../../common/dtos/base-response.dto';

@Controller('reconciliation')
@UseGuards(JwtGuard, RolesGuard)
@UseInterceptors(CorrelationIdInterceptor, ResponseInterceptor)
export class ReconciliationController {
  constructor(
    private readonly loadReconciliationUseCase: LoadReconciliationUseCase,
    private readonly validateReconciliationUseCase: ValidateReconciliationUseCase,
    private readonly searchAccountsUseCase: SearchAccountsUseCase,
    private readonly getAccountDetailUseCase: GetAccountDetailUseCase,
    private readonly getDashboardUseCase: GetDashboardUseCase,
    private readonly getIncidentsUseCase: GetIncidentsUseCase,
    private readonly exportResultsUseCase: ExportResultsUseCase,
    private readonly resolveIncidentUseCase: ResolveIncidentUseCase,
  ) {}

  @Roles('ADMIN')
  @Post('load')
  @HttpCode(HttpStatus.CREATED)
  async loadReconciliation(
    @Body() body: LoadReconciliationDto,
    @CorrelationId() correlationId: string,
  ): Promise<BaseResponseDTO<any>> {
    const result = await this.loadReconciliationUseCase.execute(body, correlationId);

    return BaseResponseDTO.success(
      'Reconciliation loaded successfully',
      result,
      correlationId,
      HttpStatus.CREATED,
    );
  }

  @Roles('ADMIN')
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateReconciliation(
    @Body() body: ValidateReconciliationDto,
    @CorrelationId() correlationId: string,
  ): Promise<BaseResponseDTO<any>> {
    const result = await this.validateReconciliationUseCase.execute(
      body.reconciliationId,
      correlationId,
    );

    return BaseResponseDTO.success(
      'Reconciliation validation completed',
      result,
      correlationId,
    );
  }

  @Roles('ADMIN', 'VIEWER')
  @Get('accounts/search')
  @HttpCode(HttpStatus.OK)
  async searchAccounts(
    @Query('q') query: string,
    @CorrelationId() correlationId: string,
  ): Promise<BaseResponseDTO<any>> {
    const result = await this.searchAccountsUseCase.execute(query ?? '');

    return BaseResponseDTO.success(
      'Accounts retrieved successfully',
      result,
      correlationId,
    );
  }

  @Roles('ADMIN', 'VIEWER')
  @Get('accounts/:id')
  @HttpCode(HttpStatus.OK)
  async getAccountDetail(
    @Param('id') accountId: string,
    @CorrelationId() correlationId: string,
  ): Promise<BaseResponseDTO<any>> {
    const result = await this.getAccountDetailUseCase.execute(accountId, correlationId);

    return BaseResponseDTO.success(
      'Account detail retrieved successfully',
      result,
      correlationId,
    );
  }

  @Roles('ADMIN', 'VIEWER')
  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  async getDashboard(
    @CorrelationId() correlationId: string,
  ): Promise<BaseResponseDTO<any>> {
    const result = await this.getDashboardUseCase.execute();

    return BaseResponseDTO.success(
      'Dashboard metrics retrieved successfully',
      result,
      correlationId,
    );
  }

  @Roles('ADMIN', 'VIEWER')
  @Get('incidents')
  @HttpCode(HttpStatus.OK)
  async getIncidents(
    @Query('reconciliationId') reconciliationId?: string,
    @Query('status') status?: string,
    @CorrelationId() correlationId: string,
  ): Promise<BaseResponseDTO<any>> {
    const result = await this.getIncidentsUseCase.execute(reconciliationId, status);

    return BaseResponseDTO.success(
      'Incident list retrieved successfully',
      result,
      correlationId,
    );
  }

  @Roles('ADMIN')
  @Patch('incidents/:id/status')
  @HttpCode(HttpStatus.OK)
  async resolveIncident(
    @Param('id') incidentId: string,
    @Body() body: ResolveIncidentDto,
    @CorrelationId() correlationId: string,
  ): Promise<BaseResponseDTO<any>> {
    const result = await this.resolveIncidentUseCase.execute(
      incidentId,
      body.status,
      correlationId,
    );

    return BaseResponseDTO.success(
      'Incident status updated successfully',
      result,
      correlationId,
    );
  }

  @Roles('ADMIN')
  @Get('export')
  @HttpCode(HttpStatus.OK)
  async exportResults(
    @Query() query: ExportResultsDto,
    @CorrelationId() correlationId: string,
  ): Promise<BaseResponseDTO<any>> {
    const result = await this.exportResultsUseCase.execute(
      query.reconciliationId ?? null,
      query.format ?? 'json',
      correlationId,
    );

    return BaseResponseDTO.success(
      'Export generated successfully',
      result,
      correlationId,
    );
  }
}
