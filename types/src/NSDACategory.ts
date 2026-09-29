import type { ZodOpenApiSchemaObject } from 'zod-openapi';
import { z } from 'zod';
import { datetime } from './utils.js';

export const NSDACategorySchema = z.object({
	id: z.number().int(),
	name: z.string().max(63).nullable(),
	type: z.enum(['c', 'd', 's']).nullable().meta({ description: 'Congress, debate or speech' }),
	code: z.number().int().nullable(),
	national: z.boolean(),
	timestamp: datetime(),
}).strict().meta({
	id: 'NSDACategory',
}) satisfies ZodOpenApiSchemaObject;

export type NSDACategory = z.infer<typeof NSDACategorySchema>;
