import personQuizRepo from '../../api/repos/personQuizRepo.js';
import factories from './index.js';
import { db } from '../../api/data/database.js';

function createData(
	overrides: Omit<
		Partial<Parameters<typeof personQuizRepo.createPersonQuiz>[1]>,
		'person' | 'quiz'
	> & {
		person: number;
		quiz: number;
	},
) {
	return {
		hidden: 0,
		pending: 0,
		completed: 1,
		approved_by: null,
		...overrides,
	};
}
async function create(
	overrides: Partial<Parameters<typeof personQuizRepo.createPersonQuiz>[1]> = {},
) {
	const person = overrides.person ?? (await factories.person.create()).id;
	const quiz = overrides.quiz ?? (await factories.quiz.create({ person })).id;

	const data = createData({
		...overrides,
		person,
		quiz,
	});

	return personQuizRepo.createPersonQuiz(db, data);
}

export default {
	create,
};