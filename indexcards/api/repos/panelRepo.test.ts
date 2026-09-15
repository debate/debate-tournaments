import panelRepo from './panelRepo.js';
import factories from '../../tests/factories/index.js';
import { db } from '../data/database.js';

describe('panelRepo', () => {
	describe('buildPanelQuery', () => {
		it('includes settings when requested', async () => {
			const panel = await factories.panel.create();

			const panelResult = await panelRepo.getPanel(
				db,
				panel.id,
				{ settings: true }
			);

			expect(panelResult).toBeDefined();
			expect(panelResult!.settings).toBeDefined();
		});
	});
	describe('getPanel', () => {
		it('retrieves panel by id', async () => {
			const panelData = factories.panel.createPanelData();
			const created = await panelRepo.createPanel(db, panelData);
			expect(created).toBeDefined();
		});
	});
	describe('getPanels', () => {
		it('retrieves all panels for a given round', async () => {
			const { roundId } = await factories.round.create();
			const panel1 = await factories.panel.create({ round: roundId });
			const panel2 = await factories.panel.create({ round: roundId });

			const results = await panelRepo.getPanels(db,{ round: roundId });
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThanOrEqual(2);
			results.forEach(s => {
				expect(s.round, `expected roundId to be ${roundId} but was ${s.round}`).toBe(roundId);
			});
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([panel1.id, panel2.id]));
		});
		it('retrieves all panels when no scope is provided', async () => {
			const panel1 = await factories.panel.create();
			const panel2 = await factories.panel.create();

			const results = await panelRepo.getPanels(db);
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThanOrEqual(2);
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([panel1.id, panel2.id]));
		});
	});
	describe('createPanel', () => {
		it('creates panel when provided valid data', async () => {
			const panel = factories.panel.createPanelData();
			const created = await panelRepo.createPanel(db,panel);
			expect(created).toBeDefined();
		});
	});
	describe('updatePanel', () => {
		it('updates panel when provided valid data', async () => {
			const panel = await factories.panel.create();
			const newData = factories.panel.createPanelData({letter: 'Z'});
			await panelRepo.updatePanel(db, panel.id, newData);
			const updated = await panelRepo.getPanel(db, panel.id);
			expect(updated).toBeDefined();
			expect(updated?.letter).toBe('Z');
		});
	});
	describe('deletePanel', () => {
		it('deletes a panel and returns true', async () => {
			// Arrange
			const panel = await factories.panel.create();
			await panelRepo.deletePanel(db,panel.id);
			const deleted = await panelRepo.getPanel(db, panel.id);
			expect(deleted).toBeUndefined();
		});
	});
	describe('getCurrentBallots', async () => {
		it('returns a current ballot when one exists', async () => {
			const data = await factories.person.createBallot();

			const result = await panelRepo.getCurrentBallots(db,data.Person.id,data.Tourn.id);

			expect(result).toBeInstanceOf(Array);
			const ballot = result[0];
			expect(ballot).toBeDefined();
			expect(ballot.Judge.id).toBe(data.Judge.id);
		});
	});
});
