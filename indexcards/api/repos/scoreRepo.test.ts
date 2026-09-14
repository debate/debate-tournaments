
import scoreRepo from './scoreRepo.js';
import factories from '../../tests/factories/index.js';
import { db } from '../data/database.js';

let ballotId: number = 0;

describe('scoreRepo', async () => {
	beforeAll(async () => {
		const ballot = await factories.ballot.create();
		ballotId = ballot.ballotId;
	});

	describe('getScores', async () => {

		it('should return an empty array if no scores exist for the ballot', async () => {
			// unlikely ballotId
			const scores = await scoreRepo.getScores(db,{ ballot: 999999 });
			expect(Array.isArray(scores)).toBe(true);
			expect(scores.length).toBe(0);
		});

		it('should return scores for a given ballotId', async () => {
			const score = await scoreRepo.createScore(db,{ ballot: ballotId });
			const scores = await scoreRepo.getScores(db,{ ballot: ballotId });
			expect(Array.isArray(scores)).toBe(true);
			expect(scores.length).toBeGreaterThan(0);
			const found = scores.find(b => b.id === score?.id as number);
			expect(found).toBeDefined();
			expect(found?.ballot).toBe(ballotId);
		});

		it('should return all scores when no scope is provided', async () => {
			// Create at least one score to ensure there is data
			await scoreRepo.createScore(db, { ballot: ballotId });
			const scores = await scoreRepo.getScores(db,{
				limit: 10,
				ballot: ballotId,
			});
			expect(Array.isArray(scores)).toBe(true);
			expect(scores.length).toBeGreaterThan(0);
		});

	});

	describe('createScore', async () => {
		it('should create a score and retrieve it', async () => {
			const score = await scoreRepo.createScore(db, { ballot: ballotId });
			expect(score).toHaveProperty('id');
			expect(score?.id).not.toBeNull();
			expect(score?.timestamp).not.toBeNull();
		});

	});

});