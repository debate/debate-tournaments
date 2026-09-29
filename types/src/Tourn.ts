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
	reg_start: utils.datetime(),
	reg_end: utils.datetime(),
	timestamp: utils.datetime(),
	settings: utils.settings,
	settingsTimestamps: utils.settingsTimestamps,
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

export const UpcomingSchema = z.object({
	id: z.string().meta({ description: 'Composite key of tournId-weekendId. weekendId is 0 for non-district tournaments' }),
	tournId: TournSchema.shape.id,
	webname: TournSchema.shape.webname,
	name: TournSchema.shape.name,
	tz: TournSchema.shape.tz,
	tzCode: z.string().meta({ description: 'Short timezone code, e.g. CDT' }),
	districts: z.enum(['Yes', 'No']),
	weekendId: z.number().int().optional().meta({ description: 'Only present for district weekends' }),
	weekendName: z.string().optional().meta({ description: 'Only present for district weekends' }),
	site: z.string().nullable().optional().meta({ description: 'Only present for district weekends' }),
	location: z.string().nullable(),
	state: TournSchema.shape.state,
	country: TournSchema.shape.country,
	start: utils.datetime(),
	end: utils.datetime(),
	regStart: utils.datetime().nullable(),
	regEnd: utils.datetime().nullable(),
	year: z.number().int(),
	week: z.number().int(),
	sortnumeric: z.number().int(),
	dates: z.string().meta({ description: 'Short date range, e.g. 5/24-5/26' }),
	fullDates: z.string().meta({ description: 'Long date range, e.g. Fri, May 24, 2024 - Sun, May 26, 2024' }),
	closed: z.string().nullable().optional(),
	special: z.string().nullable().optional(),
	circuits: z.string().nullable().optional().meta({ description: 'Comma separated circuit abbreviations' }),
	schoolCount: z.number().int(),
	nsdaCategories: z.string().meta({ description: 'Comma separated NSDA category names' }),
	eventTypes: z.string().meta({ description: 'Comma separated display names of event types' }),
	events: z.string().meta({ description: 'Comma separated event abbreviations' }),
	signup: z.string().nullable().meta({ description: 'Comma separated abbreviations of categories with open public judge signups' }),
	modes: z.string(),
	online: z.number().int(),
	inPerson: z.number().int(),
	hybrid: z.number().int(),
}).meta({
	id: 'Upcoming',
	description: 'An upcoming tournament, or a district weekend, for the public tournament listing',
}) satisfies ZodOpenApiSchemaObject;

export type Upcoming = z.infer<typeof UpcomingSchema>;

export const TournRequestSchema = z.object({
		name: TournSchema.shape.name,
		city: TournSchema.shape.city,
		state: TournSchema.shape.state,
		country: TournSchema.shape.country,
		tz: TournSchema.shape.tz,
		webname: TournSchema.shape.webname,
		start: TournSchema.shape.start,
		end: TournSchema.shape.end,
		reg_start: TournSchema.shape.reg_start.optional(),
		reg_end: TournSchema.shape.reg_end.optional(),
	}).strict().meta({
	id: 'TournRequest',
}) satisfies ZodOpenApiSchemaObject;

export const TournContactSchema = z.object({
	id: z.number().int(),
	first: z.string(),
	middle: z.string().nullable(),
	last: z.string(),
	email: z.email(),
}).meta({
	id: 'TournContact',
	description: 'A tournament contact person',
}).strict() satisfies ZodOpenApiSchemaObject;

export const BackupRequestSchema = z.object({
	scope: z.object({
		type: z.enum(['tournament', 'category', 'event', 'school']),
		id: z.number().int().optional(),
	}).strict(),
	options: z.object({
		ignoreComments: z.boolean().optional(),
		ignoreBallots: z.boolean().optional(),
	}).strict().optional(),
}).strict().meta({
	id: 'BackupRequest',
	description: 'A request to create a backup for a tournament or part of a tournament',
}) satisfies ZodOpenApiSchemaObject;