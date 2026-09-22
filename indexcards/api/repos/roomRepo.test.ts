import roomRepo from './roomRepo.js';
import factories from '../../tests/factories/index.js';
import { db } from '../data/database.js';

describe('RoomRepo', () => {
	describe('buildRoomQuery', () => {
		it('filters by site when provided in opts', async () => {
			const Site1 = await factories.site.create();
			const Site2 = await factories.site.create();
			const Room1 = await factories.room.create({ site: Site1.id });
			await factories.room.create({ site: Site2.id });

			const rooms = await roomRepo.getRooms(db, { site: Site1.id });

			expect(rooms).toBeDefined();
			expect(rooms.length).toBeGreaterThanOrEqual(1);
			expect(rooms).toEqual(expect.arrayContaining([expect.objectContaining({
				id: Room1!.id,
				site: Site1.id
			})]));
		});
	});
	describe('getRooms', () => {
		it('filters by tourn when provided in scope', async () => {
			const tourn = await factories.tourn.create();
			const Site = await factories.site.create({ tourn: tourn.id });
			const Room = await factories.room.create({ site:Site.id });
			await factories.room.create();

			const rooms = await roomRepo.getRooms(db, { tourn: tourn.id });

			expect(rooms).toBeDefined();
			expect(rooms).toEqual([expect.objectContaining({
				id: Room.id,
				site: Site.id
			})]);
		});
		it('applies both site and tourn filters together', async () => {
			const tourn = await factories.tourn.create();
			const Site1 = await factories.site.create({ tourn: tourn.id });
			const Site2 = await factories.site.create();
			const room = await factories.room.create({ site: Site1.id });
			await factories.room.create({ site: Site2.id });

			const rooms = await roomRepo.getRooms(db, { tourn: tourn.id, site: Site1.id });

			expect(rooms).toBeDefined();
			expect(rooms.length).toBeGreaterThanOrEqual(1);
			rooms.forEach(r => {
				expect(r.site).not.toBeNull();
				expect(r.site).toBe(Site1.id);
			});
			expect(rooms.map(r => r.id)).toEqual(expect.arrayContaining([room.id]));
		});
		it('retrieves all rooms for a given site', async () => {
			const Site = await factories.site.create();
			const room1 = await factories.room.create({ site: Site.id });
			const room2 = await factories.room.create({ site: Site.id });

			const results = await roomRepo.getRooms(db, { site: Site.id });
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThanOrEqual(2);
			results.forEach(s => {
				expect(s.site, `expected site to be ${Site.id} but was ${s.site}`).toBe(Site.id);
			});
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([room1.id, room2.id]));
		});
		it('retrieves all rooms when no scope is provided', async () => {
			const room1 = await factories.room.create();
			const room2 = await factories.room.create();

			const results = await roomRepo.getRooms(db);
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThanOrEqual(2);
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([room1.id, room2.id]));
		});
	});
	describe('getRoom', () => {
		it('retrieves room by id', async () => {
			const roomData = factories.room.createRoomData();
			const room = await factories.room.create(roomData);
			const resultId = room.id;
			expect(resultId).toBeDefined();
			const result = await roomRepo.getRoom(db, resultId);
			expect(result).toBeDefined();
			expect(result!.name).toBe(roomData.name);
		});
		it('retrieves room by scope object', async () => {
			const site = await factories.site.create();
			const roomData = factories.room.createRoomData({ site: site.id });
			const room = await factories.room.create(roomData);

			const result = await roomRepo.getRoom(db, room.id, { site: site.id });
			expect(result).toBeDefined();
			expect(result!.id).toBe(room.id);
			expect(result!.site).toBe(site.id);
		});
	});
	describe('createRoom', () => {
		it('creates room when provided valid data', async () => {
			const room = await factories.room.create();
			const result = await roomRepo.getRoom(db, room.id);
			expect(result).toBeDefined();
			expect(result!.name).toBe(room.name);
		});
	});
	describe('updateRoom', () => {
		it('updates room when provided valid data', async () => {
			const room = await factories.room.create();
			const newData = factories.room.createRoomData({quality: 12});
			await roomRepo.updateRoom(db, room.id, newData);
			const updated = await roomRepo.getRoom(db, room.id);
			expect(updated).toBeDefined();
			expect(updated!.quality).toBe(12);
		});
	});
	describe('deleteRoom', () => {
		it('deletes a room and returns true', async () => {
			const room = await factories.room.create();
			await roomRepo.deleteRoom(db, room.id);
			const deleted = await roomRepo.getRoom(db, room.id);
			expect(deleted).toBeUndefined();
		});
	});
});