import { db } from '../../api/data/database.js';
import resultSetRepo from '../../api/repos/resultSetRepo.js';
// Factory to create fake result_set data
export function createResultSetData(overrides = {}) {
	return {
		...overrides,
	};
}

// Factory to create a result_set in the database for tests
export async function create(overrides: Parameters<typeof resultSetRepo.createResultSet>[1] = {}) {
	const data = createResultSetData(overrides);
	return await resultSetRepo.createResultSet(db, data);
}

export default {
	createResultSetData,
	create,
};