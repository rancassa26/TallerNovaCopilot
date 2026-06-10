export const RECONCILIATION_SCHEMA = {
  type: 'object',
  properties: {
    source: { type: 'string', minLength: 3 },
    accounts: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          ledgerBalance: { type: 'number' },
          systemBalance: { type: 'number' },
          incidents: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                type: { type: 'string' },
                description: { type: 'string' },
                amount: { type: 'number' }
              },
              required: ['id', 'type', 'description', 'amount']
            }
          }
        },
        required: ['id', 'name', 'ledgerBalance', 'systemBalance']
      }
    }
  },
  required: ['source', 'accounts'],
  additionalProperties: false
};