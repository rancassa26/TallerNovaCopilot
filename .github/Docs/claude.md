Plan de Implementación - TallerNova

Visión General:
Construir una solución web para visualización, análisis y auditoría de conciliaciones contables a partir de archivos JSON.

Alcance MVP:
- Carga de JSON desde archivo local.
- Validación mediante JSON Schema.
- Dashboard con KPIs.
- Consulta de cuentas.
- Visualización de partidas conciliatorias.
- Persistencia de datos (Base de Datos Relacional).
- Gestión de estado global (NgRx o Service-based).
- Internacionalización (i18n) para soporte multimoneda y fechas.
- Gestión de incidentes.
- Filtros y exportación.
- Seguridad, observabilidad y pruebas.

Arquitectura:
- Backend: NestJS
- Frontend: Angular
- Clean Architecture
- Estrategia de Errores Global (Interceptors + Toast Notifications).
- Propagación de Correlation ID en cabeceras HTTP (Frontend Interceptor).
- SOLID, DRY, KISS, YAGNI

Capas:
- Domain
- Application
- Infrastructure
- Presentation

Módulos:
- Auth
- Reconciliation:
    - UseCases: LoadReconciliation, ValidateReconciliation.
- Dashboard
- Accounts
- Incidents:
    - UseCase: GetIncidents.
- Exports:
    - UseCase: ExportResults (JSON/CSV).
- Audit (Trazabilidad):
  - Registro unificado de logs (fetchLogs).
  - Paginación server-side (currentPage, pageSize).
  - Filtrado por UserId y Correlation ID.
  - Vista detallada de metadatos JSON.

Roadmap:
Sprint 1: Fundación (Auth, Interceptors, Base Repository)
Sprint 2: Carga y Validación
Sprint 3: Dashboard
Sprint 4: Consulta de cuentas
Sprint 5: Incidentes
Sprint 6: Exportaciones
Sprint 7: Calidad y optimización

Optimización y Performance:
- Implementación de Virtual Scrolling para tablas de gran volumen.
- Procesamiento de JSON en Web Workers.
- Estrategia de Caching para consultas frecuentes.

Pruebas:
- Swagger/OpenAPI Documentation.
- Unitarias
- Integración
- Contract Tests
Cobertura mínima: 80%.
**Nota:** Asegurar paridad absoluta entre Specs (Unit Tests) y Componentes antes de finalizar cada Sprint.

CI/CD:
Lint, Test, Coverage, Contract Tests, Build, SonarQube, Package y Deploy.
