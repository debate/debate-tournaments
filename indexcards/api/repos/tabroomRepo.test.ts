//test getSettings
import tabroomRepo from './tabroomRepo.js';
import { db } from '../data/database.js';

describe('tabroomRepo', () => {
	test('getSettings should return settings', async () => {
		await db.deleteFrom('tabroom_setting').where('tag', '=', 'foo').execute();
		await db.insertInto('tabroom_setting').values({ tag: 'foo', value: 'bar' }).execute();
		const settings = await tabroomRepo.getSettings(db, ['foo']);
		expect(settings).toBeDefined();
		expect(Array.isArray(settings)).toBe(true);
		expect(settings[0].tag).toBe('foo');
		expect(settings[0].value).toBe('bar');
	});
});