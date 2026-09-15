import  { db } from '../../api/data/database.js';
import chapterRepo from '../../api/repos/chapterRepo.js';

function createChapterData(overrides = {}) {
	return {
		name: 'Test Chapter',
		...overrides,
	};
}

export async function create(overrides = {}) {
	const chapterData = createChapterData(overrides);

	return await chapterRepo.createChapter(db, chapterData);
}
export default {
	create,
	createChapterData,
};