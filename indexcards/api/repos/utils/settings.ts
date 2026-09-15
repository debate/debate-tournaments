import { sql, type AliasedRawBuilder } from 'kysely';

import type { Database } from '../../data/database.js';
/** Possible types for a setting value. Can be a string, a Date, an object, or null.*/
type SettingValue = string | number | Date | object | null;
export type Settings = Record<string, SettingValue>;
/** Tables that have a corresponding settings table */
type SettingsTable = 
	'category' |
	'chapter' |
	'circuit' |
	'entry' |
	'event' |
	'jpool' |
	'judge' |
	'panel' |
	'person' |
	'protocol' |
	'region' |
	'round' |
	'rpool' |
	'school' |
	'student' |
	'tourn';

type SaveSettingsArgs = {
	db: Database;
	table: SettingsTable;
	settings: Settings;
	/** the ID of the owner row in the corresponding table */
	ownerId: number;
};

type SettingsSelectArgs = {
	/** which table to select settings from */
	table: SettingsTable;
	/** if the table is aliased in the query, provide the alias here */
	tableAs?: string;
	/** what settings to select, either all (true) or specific keys (string[]) */
	settings: boolean | string[];
	/** what alias to use for the resulting settings column default: settings */
	as?: string;
};
/**
 * Represents an insertable row in a *_setting table
 */
type SettingInsert = {
	value: string | null;
	value_text: string | null;
	value_date: Date | null;
	tag: string;
};
type SettingRow = SettingInsert & {
	created_at: Date | null;
	timestamp: Date | null;
};

const settingConfig = {
	category: {
		table: "category_setting",
		ownerKey: "category",
	},
	chapter: {
		table: "chapter_setting",
		ownerKey: "chapter",
	},
	circuit: {
		table: "circuit_setting",
		ownerKey: "circuit",
	},
	entry: {
		table: "entry_setting",
		ownerKey: "entry",
	},
	event: {
		table: "event_setting",
		ownerKey: "event",
	},
	jpool: {
		table: "jpool_setting",
		ownerKey: "jpool",
	},
	judge: {
		table: "judge_setting",
		ownerKey: "judge",
	},
	panel: {
		table: "panel_setting",
		ownerKey: "panel",
	},
	person: {
		table: "person_setting",
		ownerKey: "person",
	},
	protocol: {
		table: "protocol_setting",
		ownerKey: "protocol",
	},
	region: {
		table: "region_setting",
		ownerKey: "region",
	},
	round: {
		table: "round_setting",
		ownerKey: "round",
	},
	rpool: {
		table: "rpool_setting",
		ownerKey: "rpool",
	},
	school: {
		table: "school_setting",
		ownerKey: "school",
	},
	student: {
		table: "student_setting",
		ownerKey: "student",
	},
	tourn: {
		table: "tourn_setting",
		ownerKey: "tourn",
	},
} as const;


/**
 * Saves settings for a specific owner in the corresponding *_setting table
 */
export async function saveSettings({
	db,
	table,
	settings,
	ownerId,
}: SaveSettingsArgs) {
	const config = settingConfig[table];

	const rows = buildSettingsRows({
		settings,
		ownerKey: config.ownerKey,
		ownerId,
	});

	if (!rows.length) {
		return;
	}

	await db
		.insertInto(config.table)
		.values(rows)
		.onDuplicateKeyUpdate({
			value: sql`VALUES(value)`,
			value_text: sql`VALUES(value_text)`,
			value_date: sql`VALUES(value_date)`,
		})
		.execute();
}

/** 
 * Generates a SQL snippet for selecting settings as a JSON object from a *_setting table.
 */
export function selectSettings<A extends string = 'settings'>(
	{
		table,
		tableAs,
		settings,
		as,
	}: SettingsSelectArgs & { as?: A },
): AliasedRawBuilder<Record<string, string> | null, A> {
	const config = settingConfig[table];
	const ownerRefResolved = tableAs ? `${tableAs}.id` : `${table}.id`;
	const alias = as ?? 'settings';
	const tags = Array.isArray(settings) ? settings : undefined;

	const tagFilter = tags?.length
		? sql` AND setting_row_internal.tag IN (${sql.join(tags)})`
		: sql``;

	return sql<Record<string, string> | null>`(
		SELECT JSON_OBJECTAGG(
			setting_row_internal.tag,
			CASE
				WHEN setting_row_internal.value = 'date' THEN setting_row_internal.value_date
				WHEN setting_row_internal.value = 'text' THEN setting_row_internal.value_text
				WHEN setting_row_internal.value = 'json' AND JSON_VALID(setting_row_internal.value_text)
					THEN JSON_EXTRACT(setting_row_internal.value_text, '$')
				WHEN setting_row_internal.value = 'json' THEN setting_row_internal.value_text
				ELSE setting_row_internal.value
			END
		)
		FROM ${sql.table(config.table)} setting_row_internal
		WHERE ${sql.ref(`setting_row_internal.${config.ownerKey}`)} = ${sql.ref(ownerRefResolved)}
		${tagFilter}
	)`.as(alias as A);
}
/**
 * Build rows for bulk upsert into a *_setting table
 */
function buildSettingsRows({
	settings,
	ownerKey,
	ownerId,
}: {
	settings: Settings;
	ownerKey: string;
	ownerId: number;
}): SettingInsert[] {
	if (!settings || typeof settings !== 'object') return [];

	return Object.entries(settings).map(([tag, value]) => ({
		[ownerKey]: ownerId,
		tag,
		...encodeSettingValue(value, tag),
	}));
}

/**
 *  converts a setting value into appropriate DB fields
 * @param {*} value  - the setting value
 * @returns an object with keys: value, value_text, value_date
 */
function encodeSettingValue(value: unknown, tag: string) {
	const VALUE_TEXT_TAGS = ['livedoc_url'];
	// null / undefined -> clear all value fields
	if (value === null || value === undefined) {
		return {
			value: null,
			value_text: null,
			value_date: null,
		};
	}

	// Date → value_date
	if (value instanceof Date) {
		return {
			value: 'date',
			value_text: null,
			value_date: value,
		};
	}

	// Boolean → string
	if (typeof value === 'boolean') {
		return {
			value: value ? '1' : '0',
			value_text: null,
			value_date: null,
		};
	}

	// Number → string
	if (typeof value === 'number') {
		return {
			value: String(value),
			value_text: null,
			value_date: null,
		};
	}

	// String → value or value_text
	if (typeof value === 'string') {
		if (value.length <= 64 && !VALUE_TEXT_TAGS.includes(tag)) {
			return {
				value,
				value_text: null,
				value_date: null,
			};
		}

		return {
			value: 'text',
			value_text: value,
			value_date: null,
		};
	}

	// Object / Array → JSON in value_text
	return {
		value: 'json',
		value_text: JSON.stringify(value),
		value_date: null,
	};
}
