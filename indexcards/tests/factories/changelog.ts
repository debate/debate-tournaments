import changeLogRepo from '../../api/repos/changeLogRepo.js';
import { db } from '../../api/data/database.js';

export function createChangeLogData(overrides = {}) {
	return {
		...overrides,
	};
}

export async function create(overrides = {}) {
	const data = createChangeLogData(overrides);
	return await changeLogRepo.createChangeLog(db, data);
}

export default {
	create,
	createChangeLogData,
};