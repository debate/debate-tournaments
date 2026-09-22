import judgeRepo from '../../api/repos/judgeRepo.js';
import { faker } from '@faker-js/faker';
import { db } from '../../api/data/database.js';

export function buildJudgeData(overrides = {}) {
	return {
		first: faker.person.firstName(),
		last: faker.person.lastName(),
		...overrides,
	};
}

export async function create(overrides = {}) {
	const data = buildJudgeData(overrides);
	return await judgeRepo.createJudge(db, data);
}
export default {
	create,
};