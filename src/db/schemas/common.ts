// Base UUID validation
export const uuidSchema = {
  type: 'string',
  maxLength: 36,
  minLength: 36,
  pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
} as const;

// UUID validation with the Nil UUID fallback (specifically for userId)
export const uuidWithNilDefault = {
  ...uuidSchema,
  default: '00000000-0000-0000-0000-000000000000'
} as const;