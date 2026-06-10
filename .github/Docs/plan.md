Plan de Implementación - TallerNova

Visión General:
Construir una solución web para visualización, análisis y auditoría de conciliaciones contables a partir de archivos JSON.

Alcance MVP:
- Carga de JSON desde archivo local.
- Validación mediante JSON Schema.
- Dashboard con KPIs.
- Consulta de cuentas.
- Visualización de partidas conciliatorias.
- Gestión de incidentes.
- Filtros y exportación.
- Seguridad, observabilidad y pruebas.

Arquitectura:
- Backend: NestJS
- Frontend: Angular
- Clean Architecture
- SOLID, DRY, KISS, YAGNI

Capas:
- Domain
- Application
- Infrastructure
- Presentation

Módulos:
- Auth
- Reconciliation
- Dashboard
- Accounts
- Incidents
- Exports
- Audit

Roadmap:
Sprint 1: Fundación
Sprint 2: Carga y Validación
Sprint 3: Dashboard
Sprint 4: Consulta de cuentas
Sprint 5: Incidentes
Sprint 6: Exportaciones
Sprint 7: Calidad y optimización

Pruebas:
- Unitarias
- Integración
- Contract Tests
Cobertura mínima: 80%

CI/CD:
Lint, Test, Coverage, Contract Tests, Build, SonarQube, Package y Deploy.
