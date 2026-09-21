import type { ZodOpenApiSchemaObject } from 'zod-openapi';
import z from 'zod';
import * as utils from './utils.js';

export const TournSchema = z.object({
	id: utils.id,
	name: z.string().max(63),
	city: z.string().max(31).nullable(),
	state: z.string().max(6).nullable(),
	country: z.string().max(4).nullable(),
	tz: z.string().max(31),
	webname: z.string(),
	hidden: z.boolean(),
	start: utils.datetime(),
	end: utils.datetime(),
	regStart: utils.datetime(),
	regEnd: utils.datetime(),
}).strict().meta({
	id: 'Tourn',
}) satisfies ZodOpenApiSchemaObject;

export const PersonTournSummarySchema = z.object({
	id: TournSchema.shape.id,
	name: TournSchema.shape.name,
	webname: TournSchema.shape.webname,
	start: TournSchema.shape.start,
	end: TournSchema.shape.end,
	tz: TournSchema.shape.tz,
	roles: z.array(z.enum(['student','coach','judge'])),
	livedocs: z.array(z.object({
		url: z.string(),
		caption: z.string().nullable(),
	})),
	Judge: z.object({
		categoryName: z.string(),
		schoolName: z.string().nullable(),
	}).nullable(),
}).meta({
	id: 'PersonTournSummary',
	description: 'A summary of a tourn and a persons role in it for the user homepage'
}) satisfies ZodOpenApiSchemaObject;

export type PersonTournSummary = z.infer<typeof PersonTournSummarySchema>;

export type Tourn = z.infer<typeof TournSchema>;

export const TournRequestSchema = z.object({
		name: TournSchema.shape.name,
		city: TournSchema.shape.city,
		state: TournSchema.shape.state,
		country: TournSchema.shape.country,
		tz: TournSchema.shape.tz,
		webname: TournSchema.shape.webname,
		start: TournSchema.shape.start,
		end: TournSchema.shape.end,
		reg_start: TournSchema.shape.regStart.optional(),
		reg_end: TournSchema.shape.regEnd.optional(),
	}).strict().meta({
	id: 'TournRequest',
}) satisfies ZodOpenApiSchemaObject;

export const TournContactSchema = {
	type : 'object',
	description: 'A tournament contact person',
	properties: {
		id: {
			type: 'integer',
			description: 'The unique identifier for the contact person',
			readOnly: true,
			example: 456,
		},
		first: {
			type: 'string',
			description: 'The first name of the contact person',
			example: 'John',
		},
		middle: {
			type: ['string', 'null'],
			description: 'The middle name of the contact person',
			example: 'A.',
		},
		last: {
			type: 'string',
			description: 'The last name of the contact person',
			example: 'Doe',
		},
		email: {
			type: 'string',
			format: 'email',
			description: 'The email address of the contact person',
			example: 'johndoe@example.com',
		},
	},
} as const satisfies ZodOpenApiSchemaObject;

export const BackupRequestSchema = {
	type: 'object',
	description: 'A request to create a backup for a tournament or part of a tournament',
	required: ['scope'],
	properties: {
		scope: {
			type: 'object',
			description: 'Defines what part of the tournament to back up',
			required: ['type'],
			properties: {
				type: {
					type: 'string',
					description: 'The scope of the backup',
					enum: ['tournament', 'category', 'event', 'school'],
				},
				id: {
					type: 'integer',
					description:
				'The ID of the category, event, or school being backed up (required when scope type is not "tournament")',
				},
			},
			additionalProperties: false,
		},

		options: {
			type: 'object',
			description: 'Optional flags that affect how the backup is generated',
			properties: {
				ignoreComments: {
					type: 'boolean',
					description: 'Exclude comments from the backup',
				},
				ignoreBallots: {
					type: 'boolean',
					description: 'Exclude ballots from the backup',
				},
			},
			additionalProperties: false,
		},
	},
	additionalProperties: false,
} as const satisfies ZodOpenApiSchemaObject;
