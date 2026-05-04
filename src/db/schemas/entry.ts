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
    hostnameUrl: { type: 'string' }, // the origin Url without path, query, or fragment (hidden from user input derived from url)
    pathnameUrl: { type: 'string' }, // represents the path only (hidden from user input derived from url)
    searchUrl: { type: 'string' }, // search part of the url (hidden from user input derived from url)
    faviconUrl: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    siteName: { type: 'string' },
    //excerpt: { type: 'string' }, // not needed currently, put in description for now.
    //byline: { type: 'string' }, // not needed currently, put in description for now.
    //publishedAt: { type: 'string', format: 'date-time' } //not needed currently, put in description for now.
    // For description a nicely formatted string can be generated through the combination of 
    // excerpt, byline, and publishedAt as a default description, when capturing
  },
  required: [
    'id', 
    'userId', 
    'topicId', 
    'title', 
    'tags', 
    'isFavorite', 
    'languageCode', 
    // 'url', // (not strictly required)
    // 'hostnameUrl', // (not strictly required)
    // 'pathnameUrl', // (not strictly required)
    // 'searchUrl', // (not strictly required)
    'createdAt'
  ],
  indexes: ['topicId', 'userId']
} as const;

export const entrySchema = toTypedRxJsonSchema(entrySchemaLiteral);
export type EntryDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof entrySchemaLiteral>;
