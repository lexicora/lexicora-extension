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
    isPinned: { type: 'boolean' },
    isArchived: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    // INTERNAL:
    searchBlob: { type: 'string', maxLength: 2020 }, // Auto-populated denormalized search field (name + tags + description snippet + updatedAt date tokens)
  },
  required: ['id', 'userId', 'name', 'tags', 'isFavorite', 'isPinned', 'isArchived', 'createdAt', 'updatedAt'],
  indexes: [
    'userId',
    ['isPinned', 'updatedAt'],
    ['isArchived', 'isPinned', 'updatedAt'],
    ['isFavorite', 'isArchived', 'isPinned', 'updatedAt'],
  ]
} as const;

export const topicSchema = toTypedRxJsonSchema(topicSchemaLiteral);
export type TopicDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof topicSchemaLiteral>;
