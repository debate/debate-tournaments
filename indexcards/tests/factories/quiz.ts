import { db } from '../../api/data/database.js';
import factories from './index.js';
import quizRepo from '../../api/repos/quizRepo.js';
import type { Insertable } from 'kysely';
import type { Quiz } from '../../api/data/schema.js';

function createQuizData(
	overrides: Omit<Partial<Insertable<Quiz>>, 'person'> & {
		person: number;
	},
) {
	return {
		label: 'Test Quiz',
		description: 'This is a test quiz.',
		sitewide: 1,
		hidden: 0,
		approval: 0,
		show_answers: 0,
		admin_only: 0,
		badge_description: 'Test Badge',
		badge: 'test_badge',
		badge_link: 'https://example.com/test_badge.png',
		...overrides,
	};
}

async function create(overrides: Partial<Insertable<Quiz>> = {}) {
	const person = overrides.person ?? (await factories.person.create()).id;

	const data = createQuizData({
		...overrides,
		person,
	});
	return await quizRepo.createQuiz(db, data);
}

export default {
	createQuizData,
	create,
};