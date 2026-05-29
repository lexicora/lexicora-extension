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
    name: { type: 'string', maxLength: 255 },
    description: { type: 'string', maxLength: 1000 },
    tags: {
      type: 'array',
      maxItems: 10,
      items: { type: 'string', maxLength: 50 }
    },
    isFavorite: { type: 'boolean' },
    //isPinned: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'userId', 'name', 'tags', 'isFavorite', 'createdAt', 'updatedAt'],
  indexes: ['userId'] // TODO: Adjust compound indexes as needed based on query patterns (e.g., userId + createdAt for sorting topics for a user)
} as const;

export const topicSchema = toTypedRxJsonSchema(topicSchemaLiteral);
export type TopicDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof topicSchemaLiteral>;
