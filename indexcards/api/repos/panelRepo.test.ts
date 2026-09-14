import panelRepo from './panelRepo.js';
import factories from '../../tests/factories/index.js';
import { db } from '../data/database.js';

describe('panelRepo', () => {
	describe('buildSectionQuery', () => {
		it('includes settings when requested', async () => {
			const { sectionId } = await factories.section.create();

			const section = await panelRepo.getSection(
				db,
				sectionId,
				{ settings: true }
			);

			expect(section).toBeDefined();
			expect(section.settings).toBeDefined();
		});
	});
	describe('getSection', () => {
		it('retrieves section by id', async () => {
			const sectionData = factories.section.createPanelData();
			const resultId = await panelRepo.createPanel(db, sectionData);
			expect(resultId).toBeDefined();
			const result = await panelRepo.getSection(db, resultId);
			expect(result).toBeDefined();
			expect(result.name).toBe(sectionData.name);
		});
		it('throws an error when id is not provided', async () => {
			await expect(panelRepo.getSection()).rejects.toThrow();
		});
	});
	describe('getSections', () => {
		it('retrieves all sections for a given round', async () => {
			const { roundId } = await factories.round.create();
			const section1 = await factories.section.create({ round: roundId });
			const section2 = await factories.section.create({ round: roundId });

			const results = await panelRepo.getSections(db,{ round: roundId });
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThanOrEqual(2);
			results.forEach(s => {
				expect(s.round, `expected roundId to be ${roundId} but was ${s.round}`).toBe(roundId);
			});
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([section1.id, section2.id]));
		});
		it('retrieves all sections when no scope is provided', async () => {
			const section1 = await factories.section.create();
			const section2 = await factories.section.create();

			const results = await panelRepo.getSections(db);
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThanOrEqual(2);
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([section1.id, section2.id]));
		});
	});
	describe('createPanel', () => {
		it('creates section when provided valid data', async () => {
			const section = factories.section.createPanelData();
			const created = await panelRepo.createPanel(db,section);
			expect(created).toBeDefined();
		});
	});
	describe('updateSection', () => {
		it('updates section when provided valid data', async () => {
			const section = await factories.section.create();
			const newData = factories.section.createPanelData({letter: 'Z'});
			const result = await panelRepo.updateSection(db, section.id, newData);
			expect(result).toBe(true);
			const updated = await panelRepo.getSection(db, section.id);
			expect(updated).toBeDefined();
			expect(updated?.letter).toBe('Z');
		});
	});
	describe('deleteSection', () => {
		it('deletes a section and returns true', async () => {
			// Arrange
			const section = await factories.section.create();
			await panelRepo.deleteSection(db,section.id);
			const deleted = await panelRepo.getSection(db, section.id);
			expect(deleted).toBeUndefined();
		});
	});
	describe('getCurrentBallots', async () => {
		it('returns a current ballot when one exists', async () => {
			const data = await factories.person.createBallot();

			const result = await panelRepo.getCurrentBallots(db,data.personId,data.tournId);

			expect(result).toBeInstanceOf(Array);
			const ballot = result[0];
			expect(ballot).toBeDefined();
			expect(ballot.Judge.id).toBe(data.judgeId);
		});
	});
});
