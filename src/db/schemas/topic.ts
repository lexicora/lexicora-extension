import { ExtractDocumentTypeFromTypedRxJsonSchema, toTypedRxJsonSchema } from 'rxdb';

export const topicSchemaLiteral = {
  title: 'topic schema',
  version: 0,
  description: 'Describes a topic',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'name', 'createdAt']
} as const;

export const topicSchema = toTypedRxJsonSchema(topicSchemaLiteral);
export type TopicDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof topicSchemaLiteral>;
