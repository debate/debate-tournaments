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

export async function create(overrides: Partial<Parameters<typeof chapterJudgeRepo.createChapterJudge>[1]> = {}) {
	
	if (!overrides.chapter) {
		const chapter = await factories.chapter.create();
		overrides.chapter = chapter.id;
	}
	
	const data = buildChapterJudgeData(overrides);


	return await chapterJudgeRepo.createChapterJudge(db, data);
}

export default {
	create,
	buildChapterJudgeData,
};
