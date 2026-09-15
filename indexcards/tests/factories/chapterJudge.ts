import { faker } from '@faker-js/faker';
import { db } from '../../api/data/database.js';
import chapterJudgeRepo from '../../api/repos/chapterJudgeRepo.js';
import factories from './index.js';

export function buildChapterJudgeData(overrides = {}) {
	return {
		first: faker.person.firstName(),
		last: faker.person.lastName(),
		...overrides,
	};
}

export async function create(overrides = {}) {
	const data = buildChapterJudgeData(overrides);

	if (!data.chapter) {
		const chapter = await factories.chapter.create();
		data.chapter = chapter.id;
	}

	return await chapterJudgeRepo.createChapterJudge(db, data);
}

export default {
	create,
	buildChapterJudgeData,
};
