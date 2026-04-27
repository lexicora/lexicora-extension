import { ExtractDocumentTypeFromTypedRxJsonSchema, toTypedRxJsonSchema } from 'rxdb';
import { uuidSchema, uuidWithNilDefault } from './common';

const entrySchemaLiteral = {
  title: 'entry schema',
  version: 0,
  description: 'Describes an entry within a topic',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: uuidSchema,
    userId: uuidWithNilDefault,
    topicId: uuidSchema,
    title: { type: 'string' },
    description: { type: 'string' },
    tags: {
      type: 'array',
      maxItems: 10,
      items: { type: 'string', maxLength: 50 }
    },
    isFavorite: { type: 'boolean' },
    languageCode: { type: 'string' },
    url: { type: 'string' },
    originUrl: { type: 'string' },
    pathUrl: { type: 'string' },
    faviconUrl: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    siteName: { type: 'string' },
    excerpt: { type: 'string' },
    byline: { type: 'string' },
    publishedAt: { type: 'string', format: 'date-time' }
  },
  required: [
    'id', 
    'userId', 
    'topicId', 
    'title', 
    'tags', 
    'isFavorite', 
    'languageCode', 
    'url', 
    'originUrl', 
    'createdAt'
  ],
  indexes: ['id', 'topicId', 'userId']
} as const;

export const entrySchema = toTypedRxJsonSchema(entrySchemaLiteral);
export type EntryDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof entrySchemaLiteral>;
