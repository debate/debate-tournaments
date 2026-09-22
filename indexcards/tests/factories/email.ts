import { db } from '../../api/data/database.js';
import { faker } from '@faker-js/faker';

function buildEmailData(overrides = {}) {
	return {
		content: faker.lorem.paragraph(),
		...overrides,
	};
}


async function create(overrides = {}) {
	return await db.insertInto('email')
	.values(buildEmailData(overrides))
	.returningAll()
	.executeTakeFirstOrThrow();
}

export default {
	create
};