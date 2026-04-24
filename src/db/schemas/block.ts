import { ExtractDocumentTypeFromTypedRxJsonSchema, toTypedRxJsonSchema } from 'rxdb';

export const blockSchemaLiteral = {
  title: 'block schema',
  version: 0,
  description: 'Describes a block component of an entry',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    entryId: { type: 'string' },
    type: { type: 'string' },
    body: { type: 'string' }
  },
  required: ['id', 'entryId', 'type', 'body'],
  indexes: ['entryId']
} as const;

export const blockSchema = toTypedRxJsonSchema(blockSchemaLiteral);
export type BlockDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof blockSchemaLiteral>;
