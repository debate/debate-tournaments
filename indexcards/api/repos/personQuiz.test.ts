import factories from '../../tests/factories/index.js';
import personQuizRepo from './personQuizRepo.js';
import { db } from '../../api/data/database.js';

describe('PersonQuizRepo', () => {
	describe('createPersonQuiz', () => {
		it('creates a new PersonQuiz and returns its id', async () => {
			// Arrange
			const Person = await factories.person.create();
			const Quiz = await factories.quiz.create({ person: Person.id });
			const personQuizData = {
				person: Person.id,
				quiz: Quiz.id,
				hidden: 0,
				pending: 0,
				completed: 1,
				approved_by: null,
			};
			// Act
			const personQuizId = await personQuizRepo.createPersonQuiz(db, personQuizData);

			// Assert
			expect(personQuizId).toBeDefined();
		});
	});
});