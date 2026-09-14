import type { Database } from '../data/database.js';

async function getSettings(db: Database, settings: string[]) {
	return db.selectFrom('tabroom_setting')
		.where('tag', 'in', settings)
		.execute();
}

export default {
	getSettings,
};