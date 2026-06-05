# TallerNova

## Objetivo
Desarrollar una plataforma web para análisis y visualización de conciliaciones contables a partir de archivos JSON.

## Stack
Backend:
- NestJS
- TypeScript
- Jest
- Swagger/OpenAPI

Frontend:
- Angular
- TypeScript
- RxJS

## Arquitectura
Implementar Clean Architecture.

Capas obligatorias:
- Domain
- Application
- Infrastructure
- Presentation

## Principios
- SOLID
- DRY
- KISS
- YAGNI
- Separation of Concerns

## Reglas
- No colocar lógica de negocio en controllers.
- No colocar lógica de negocio en componentes Angular.
- Toda regla funcional debe vivir en Domain o Application.
- Utilizar DTOs.
- Utilizar Repository Pattern.
- Utilizar Dependency Injection.

## Funcionalidades
- LoadReconciliationUseCase
- ValidateReconciliationUseCase
- SearchAccountsUseCase
- GetAccountDetailUseCase
- GetDashboardUseCase
- GetIncidentsUseCase
- ExportResultsUseCase

## Seguridad
Roles:
- ADMIN
- VIEWER

JWT obligatorio.

## Testing
Cobertura mínima 80%.
Implementar Unit Tests, Integration Tests y Contract Tests.

## Observabilidad
- Logging estructurado JSON
- Correlation ID
- Métricas básicas

## CI/CD
1. Lint
2. Unit Tests
3. Coverage
4. Contract Tests
5. Build Backend
6. Build Frontend
7. SonarQube
8. Package
9. Deploy QA
