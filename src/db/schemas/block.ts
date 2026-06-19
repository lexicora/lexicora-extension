import { ExtractDocumentTypeFromTypedRxJsonSchema, toTypedRxJsonSchema } from 'rxdb';
import { blockTypes, uuidSchema, uuidWithNilDefault } from './common';

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
    type: { type: 'string', enum: blockTypes },
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
  required: ['id', 'userId', 'entryId', 'order', 'type', 'propsJson'],
  indexes: ['entryId', 'userId']
} as const;

export const blockSchema = toTypedRxJsonSchema(blockSchemaLiteral);

// RxDB's type extractor maps `type: ['array', 'object']` only to an object index
// signature, which rejects array literals. Override contentJson to `unknown` since
// it genuinely holds either inline-content arrays or structural objects at runtime.
type _RawBlockDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof blockSchemaLiteral>;
export type BlockDocType = Omit<_RawBlockDocType, "contentJson"> & {
  contentJson?: unknown;
};
