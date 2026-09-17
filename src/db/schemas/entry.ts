import { type ExtractDocumentTypeFromTypedRxJsonSchema, toTypedRxJsonSchema } from 'rxdb';
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
    //* maxLength is required on any indexed string; ISO timestamps are 24
    //* characters ("2026-09-14T12:00:00.000Z"), so 30 leaves room to spare.
    createdAt: { type: 'string', format: 'date-time', maxLength: 30 },
    updatedAt: { type: 'string', format: 'date-time', maxLength: 30 },
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
    'archivedExplicitly',
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
    //* NOTE: `userId` is still stored — every document carries the nil UUID
    //* until accounts exist — but nothing queries by it, so the index only cost
    //* a key per document. Re-add it when sync actually filters by user.
    //'userId',
    //* Entries captured from one site: the home page's "From this site" list
    //* and its total, and the library's `site:` search. Compound because a
    //* count on Dexie must be answerable from an index alone — with
    //* `hostnameUrl` by itself, filtering out archived entries was not, and
    //* RxDB refused the count. Leading with `hostnameUrl` still serves the
    //* queries that filter by host alone.
    ['hostnameUrl', 'isArchived'],
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
