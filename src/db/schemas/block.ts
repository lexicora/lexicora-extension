import { ExtractDocumentTypeFromTypedRxJsonSchema, toTypedRxJsonSchema } from 'rxdb';
import { uuidSchema, uuidWithNilDefault } from './common';

const blockSchemaLiteral = {
  title: 'block schema',
  version: 0,
  description: 'Describes a block component of an entry',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: uuidSchema,
    userId: uuidWithNilDefault,
    entryId: uuidSchema,
    parentBlockId: uuidSchema, // Optional FK link to the parent block within the same entry
    order: { type: 'number' },
    type: { type: 'string' },
    propsJson: { 
      type: 'object',
      additionalProperties: true
    },
    contentJson: { 
      // It can be an array of inline content segments or objects; we allow flexibility here.
      type: ['array', 'object'], 
      additionalProperties: true 
    }
  },
  required: ['id', 'entryId', 'order', 'type', 'propsJson'],
  indexes: ['id', 'entryId', 'parentBlockId', 'userId']
} as const;

export const blockSchema = toTypedRxJsonSchema(blockSchemaLiteral);
export type BlockDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof blockSchemaLiteral>;
