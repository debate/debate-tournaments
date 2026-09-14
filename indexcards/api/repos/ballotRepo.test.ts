
import ballotRepo from './ballotRepo.js';
import factories from '../../tests/factories/index.js';
import { db } from '../data/database.js';
import type { Panel } from '../data/schema.js';
import type { Selectable } from 'kysely';

let section: Selectable<Panel> | null = null;

describe('ballotRepo', async () => {
	beforeAll(async () => {
		section = await factories.section.create();
	});
	describe('getBallots', async () => {

		it('should return an empty array if no ballots exist for the section', async () => {
			const ballots = await ballotRepo.getBallots(db, { panel: 999999 }); // unlikely sectionId
			expect(Array.isArray(ballots)).toBe(true);
			expect(ballots.length).toBe(0);
		});

		it('should return ballots for a given sectionId', async () => {
			const ballot = await ballotRepo.createBallot(db, { panel: section!.id });
			const ballots = await ballotRepo.getBallots(db, { panel: section!.id });
			expect(Array.isArray(ballots)).toBe(true);
			expect(ballots.length).toBeGreaterThan(0);
			const found = ballots.find(b => b.id === ballot?.id);
			expect(found).toBeDefined();
			expect(found?.panel).toBe(section!.id);
		});
	});
	describe('createBallot', async () => {
		it('should create a ballot and retrieve it', async () => {
			const ballot = await ballotRepo.createBallot(db, { panel: section!.id });
			const retrievedBallot = await ballotRepo.getBallot(db, ballot!.id);

			//ensure that id, updatedAt and createdAt are present and not null
			expect(retrievedBallot).toHaveProperty('id');
			expect(retrievedBallot?.id).not.toBeNull();
			expect(retrievedBallot?.timestamp).not.toBeNull();
			expect(retrievedBallot?.created_at).not.toBeNull();
		});
	});

});