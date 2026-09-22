import { faker } from '@faker-js/faker';
import fileRepo from '../../api/repos/fileRepo.js';
import { db } from '../../api/data/database.js';

export function buildFileData(overrides = {}) {
	return {
		fileName: faker.system.fileName(),
		uploaded: faker.date.past(),
		...overrides,
	};
}

export async function create(overrides = {}) {
	const data = buildFileData(overrides);
	return await fileRepo.createFile(db, data);
}
export default {
	create,
};