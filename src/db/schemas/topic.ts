import { type ExtractDocumentTypeFromTypedRxJsonSchema, toTypedRxJsonSchema } from 'rxdb';
import { uuidSchema, uuidWithNilDefault } from './common';
import { KEY_COMPRESSION_ENABLED } from '../key-compression';

const topicSchemaLiteral = {
  title: 'topic schema',
  version: 0,
  //* Shortened property keys in production only; see db/key-compression.
  keyCompression: KEY_COMPRESSION_ENABLED,
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
    //* maxLength is required on any indexed string; ISO timestamps are 24
    //* characters ("2026-09-14T12:00:00.000Z"), so 30 leaves room to spare.
    createdAt: { type: 'string', format: 'date-time', maxLength: 30 },
    updatedAt: { type: 'string', format: 'date-time', maxLength: 30 },
    // INTERNAL:
    searchBlob: { type: 'string', maxLength: 2020 }, // Auto-populated denormalized search field (name + tags + description snippet + updatedAt date tokens)
  },
  required: ['id', 'userId', 'name', 'tags', 'isFavorite', 'isPinned', 'isArchived', 'createdAt', 'updatedAt'],
  indexes: [
    //* NOTE: `userId` is still stored — every document carries the nil UUID
    //* until accounts exist — but nothing queries by it, so the index only cost
    //* a key per document. Re-add it when sync actually filters by user.
    //'userId',
    ['isPinned', 'updatedAt'],
    ['isArchived', 'isPinned', 'updatedAt'],
    ['isFavorite', 'isArchived', 'isPinned', 'updatedAt'],
  ]
} as const;

export const topicSchema = toTypedRxJsonSchema(topicSchemaLiteral);
export type TopicDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof topicSchemaLiteral>;
