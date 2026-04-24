import { ExtractDocumentTypeFromTypedRxJsonSchema, toTypedRxJsonSchema } from 'rxdb';

export const entrySchemaLiteral = {
  title: 'entry schema',
  version: 0,
  description: 'Describes an entry within a topic',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    topicId: { type: 'string' },
    title: { type: 'string' },
    content: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'topicId', 'title', 'content', 'createdAt'],
  indexes: ['topicId']
} as const;

export const entrySchema = toTypedRxJsonSchema(entrySchemaLiteral);
export type EntryDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof entrySchemaLiteral>;
