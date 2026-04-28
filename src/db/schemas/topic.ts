import { ExtractDocumentTypeFromTypedRxJsonSchema, toTypedRxJsonSchema } from 'rxdb';
import { uuidSchema, uuidWithNilDefault } from './common';

const topicSchemaLiteral = {
  title: 'topic schema',
  version: 0,
  description: 'Describes a topic',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: uuidSchema,
    userId: uuidWithNilDefault,
    name: { type: 'string' },
    description: { type: 'string' },
    tags: {
      type: 'array',
      maxItems: 10,
      items: { type: 'string', maxLength: 50 }
    },
    isFavorite: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  required: ['userId', 'name', 'tags', 'isFavorite', 'createdAt'],
  indexes: ['userId']
} as const;

export const topicSchema = toTypedRxJsonSchema(topicSchemaLiteral);
export type TopicDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof topicSchemaLiteral>;
