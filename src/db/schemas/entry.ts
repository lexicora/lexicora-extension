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
    title: { type: 'string', maxLength: 255 }, //? Maybe rename from title to name.
    description: { type: 'string', maxLength: 1000 },
    tags: {
      type: 'array',
      maxItems: 10,
      items: { type: 'string', maxLength: 50 }
    },
    isFavorite: { type: 'boolean' },
    isPinned: { type: 'boolean' },
    isArchived: { type: 'boolean' },
    archivedExplicitly: { type: 'boolean' }, // true only when the user directly archived this entry (not via parent topic)
    languageCode: { type: 'string', maxLength: 10 },
    url: { type: 'string', maxLength: 2048 },
    hostnameUrl: { type: 'string', maxLength: 600 }, // the origin Url without path, query, or fragment (hidden from user input derived from url)
    pathnameUrl: { type: 'string', maxLength: 700 }, // represents the path only (hidden from user input derived from url)
    searchUrl: { type: 'string', maxLength: 700 }, // search part of the url (hidden from user input derived from url)
    // Maybe add hashUrl
    faviconUrl: { type: 'string', maxLength: 1000 }, // base64 encoded favicon might be too long, for this.
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    siteName: { type: 'string', maxLength: 255 },
    // INTERNAL:
    searchBlob: { type: 'string', maxLength: 3620 }, // Auto-populated denormalized search field (title + tags + description snippet + siteName + hostnameUrl + updatedAt date tokens)
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
    'isPinned',
    'isArchived',
    'languageCode', 
    'url', // (not strictly required, empty allowed)
    'hostnameUrl', // (not strictly required, empty allowed)
    'pathnameUrl', // (not strictly required, empty allowed)
    'searchUrl', // (not strictly required, empty allowed)
    'createdAt',
    'updatedAt'
  ],
  indexes: [
    'topicId',
    'userId',
    ['isPinned', 'updatedAt'],
    ['isArchived', 'isPinned', 'updatedAt'],
    ['isFavorite', 'isArchived', 'isPinned', 'updatedAt'],
    ['topicId', 'isArchived', 'isPinned', 'updatedAt'],
    ['topicId', 'isFavorite', 'isArchived', 'isPinned', 'updatedAt'],
    ['topicId', 'archivedExplicitly'],
  ]
} as const;

export const entrySchema = toTypedRxJsonSchema(entrySchemaLiteral);
export type EntryDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof entrySchemaLiteral>;
