import entryRepo from './entryRepo.js';
import { db } from '../data/database.js';
import factories from '../../tests/factories/index.js';

describe('entryRepo', () => {
	describe('getEntry', () => {
		it('should retrieve an entry by ID', async () => {
			const createdEntry = await factories.entry.create();
			const entry = await entryRepo.getEntry(db, createdEntry.id);
			expect(entry).toBeDefined();
			expect(entry?.id).toBe(createdEntry.id);
		});
		it('attaches settings correctly', async () => {
			const createdEntry = await factories.entry.create({ settings: { key: 'value' } });
			const entry = await entryRepo.getEntry(db, createdEntry.id, { settings: true });
			expect(entry).toBeDefined();
			expect(entry?.settings).toBeDefined();
			expect(entry?.settings?.key).toBe('value');
		});
	});
});