describe('Flujo de Validación de Conciliación', () => {
  beforeEach(() => {
    // Interceptamos la carga inicial del Dashboard
    cy.intercept('GET', '**/api/reconciliation/dashboard', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          totalReconciliations: 5,
          totalAccounts: 20,
          totalIncidents: 2,
          totalDifference: -150.50,
          incidentsByType: { 'BALANCE_MISMATCH': 2 },
          recentReconciliations: [
            { id: 'REC-001', source: 'banco_central.json', loadedAt: new Date().toISOString(), totalDifference: -150.50 }
          ]
        },
        correlationId: 'init-dashboard-uuid'
      }
    }).as('getDashboard');

    // Interceptamos la petición de Validación
    cy.intercept('POST', '**/api/reconciliation/validate', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Validation process completed',
        data: {
          reconciliationId: 'REC-001',
          source: 'banco_central.json',
          valid: false,
          totalAccounts: 1,
          totalDifference: -150.50,
          validations: [
            {
              accountId: 'ACC-99',
              accountName: 'Caja General',
              ledgerBalance: 1000,
              systemBalance: 849.50,
              difference: -150.50,
              valid: false,
              issues: ['Balance mismatch']
            }
          ]
        },
        correlationId: 'val-uuid-123'
      }
    }).as('validateReq');

    // Seteamos el token en localStorage para bypass de login
    window.localStorage.setItem('auth_token', 'fake-jwt-token-admin');
    
    cy.visit('/reconciliation/dashboard');
    cy.wait('@getDashboard');
  });

  it('debe ejecutar la validación, mostrar alertas y abrir el modal de detalles', () => {
    // 1. Verificar presencia de la conciliación en la tabla
    cy.get('table').should('contain', 'banco_central.json');

    // 2. Hacer clic en el botón de validar
    cy.get('button').contains('Validar').first().click();

    // 3. Verificar estado de carga (Spinner de Bootstrap definido en el HTML)
    cy.get('.spinner-border').should('exist');

    // 4. Esperar respuesta del servidor
    cy.wait('@validateReq');

    // 5. Verificar que el Toast de error/alerta aparezca (Capa MatSnackBar)
    cy.get('.mat-mdc-snack-bar-container').should('contain', 'Validación finalizada con alertas');

    // 6. Verificar que el modal de detalles se haya abierto automáticamente
    cy.get('mat-dialog-container').should('be.visible');
    cy.get('mat-dialog-container').should('contain', 'Detalles de Validación');
    cy.get('mat-dialog-container table').should('contain', 'Caja General');
    cy.get('mat-dialog-container table').should('contain', '-150.50');

    // 7. Cerrar modal y verificar refresco de Dashboard
    cy.get('button').contains('Cerrar').click();
    cy.wait('@getDashboard');
  });
});