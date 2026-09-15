import factories from '../../tests/factories/index.js';
import personQuizRepo from './personQuizRepo.js';

describe('PersonQuizRepo', () => {
	describe('createPersonQuiz', () => {
		it('creates a new PersonQuiz and returns its id', async () => {
			// Arrange
			const Person = await factories.person.create();
			const Quiz = await factories.quiz.create({ person: Person.id });
			const personQuizData = {
				person: Person.id,
				quiz: Quiz.id,
				hidden: false,
				pending: false,
				completed: true,
				approvedBy: null,
			};
			// Act
			const personQuizId = await personQuizRepo.createPersonQuiz(personQuizData);

			// Assert
			expect(personQuizId).toBeDefined();
		});
	});
});