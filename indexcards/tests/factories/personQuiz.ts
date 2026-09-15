import personQuizRepo from '../../api/repos/personQuizRepo.js';
import factories from './index.js';

async function createData(overrides = {}) {
	return {
		hidden: false,
		pending: false,
		completed: true,
		approvedBy: null,
		...overrides,
	};
}
async function create(overrides = {}) {
	const data = await createData(overrides);
	if (!data.person) {
		const Person = await factories.person.create();
		data.person = Person.id;
	}
	if (!data.quiz) {
		const Quiz = await factories.quiz.create({ person: data.person });
		data.quiz = Quiz.id;
	}
	return await personQuizRepo.createPersonQuiz(data);
}

export default {
	create,
};