import type { ZodOpenApiSchemaObject } from 'zod-openapi';
import z from 'zod';
import * as utils from './utils.js';

export const EventSchema = z.object({
	id: utils.id,
	abbr: z.string(),
	name: z.string(),
	fee: z.number(),
	type: z.enum(['debate', 'speech', 'mock_trial', 'congress', 'wsdc', 'wudc', 'attendee', 'academic']),
	categoryId: utils.id,
	settings: z.object({
		flight_offset: z.int().nullable(),
		online_mode: z.string().nullable(),
		online_ballots: z.boolean(),
	}),
	metadata: z.object(),
	nsdaCategoryId: utils.id.nullable(),
}).meta({ id: 'Event'}) satisfies ZodOpenApiSchemaObject;

export type Event = z.infer<typeof EventSchema>;

export const EventFieldSchema = z.object({
	id: utils.id,
	name: z.string().nullable(),
	abbr: z.string().nullable(),
	type: EventSchema.shape.type,
	category: utils.id.nullable(),
	tourn: utils.id.nullable(),
	settings: z.object({
		fieldWaitlist: z.string().nullable().meta({ description: 'Whether waitlisted entries are shown' }),
		fieldReport: z.string().meta({ description: 'Whether the field report is published' }),
	}).strict(),
	Entries: z.array(z.object({
		id: utils.id,
		name: z.string().nullable(),
		code: z.string().nullable(),
		active: z.int(),
		waitlist: z.int(),
		School: z.object({
			id: utils.id.nullable(),
			name: z.string().nullable(),
			code: z.string().nullable(),
		}).strict(),
		Students: z.array(z.object({
			id: utils.id,
			first: z.string().nullable(),
			middle: z.string().nullable(),
			last: z.string().nullable(),
			chapter: utils.id.nullable(),
		}).strict()),
	}).strict()),
}).strict().meta({
	id: 'EventField',
	description: 'The published field of entries for an event',
}) satisfies ZodOpenApiSchemaObject;

export type EventField = z.infer<typeof EventFieldSchema>;
