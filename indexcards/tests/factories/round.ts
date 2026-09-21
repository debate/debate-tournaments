import roundRepo from '../../api/repos/roundRepo.js';
import { db } from '../../api/data/database.js';

export function createRoundData(overrides = {}) {
	return {
		published: 1,
		...overrides,
	};
}

export async function create(overrides: Parameters<typeof roundRepo.createRound>[1] = {}) {
	const data = createRoundData(overrides);
	return await roundRepo.createRound(db,data);
}

export default {
	createRoundData,
	create,
};
