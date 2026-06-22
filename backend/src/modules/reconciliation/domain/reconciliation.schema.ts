/**
 * RECONCILIATION_SCHEMA - Esquema JSON para validación estructural.
 */
export const RECONCILIATION_SCHEMA = {
  type: 'object',
  properties: {
    source: { type: 'string' },
    timestamp: { type: 'string' },
    accounts: {
      type: 'array',
      items: { type: 'object' }
    }
  },
  required: ['source', 'accounts']
};