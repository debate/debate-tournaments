import roomRepo, { roomInclude } from './roomRepo.js';
import factories from '../../tests/factories/index.js';

describe('RoomRepo', () => {
	describe('buildRoomQuery', () => {
		it('filters by site when provided in opts', async () => {
			const Site1 = await factories.site.create();
			const Site2 = await factories.site.create();
			const { roomId: room1Id } = await factories.room.create({ site: Site1.id });
			await factories.room.create({ site: Site2.id });

			const rooms = await roomRepo.getRooms({ siteId: Site1.id }, { include: { site: true } });

			expect(rooms).toBeDefined();
			expect(rooms.length).toBeGreaterThanOrEqual(1);
			rooms.forEach(r => {
				expect(r.site).not.toBeNull();
				expect(r.site.id).toBe(Site1.id);
			});
			expect(rooms.map(r => r.id)).toEqual(expect.arrayContaining([room1Id]));
		});
		it('do not include site attributes when site is only requested as a filter', async () => {
			const Tourn = await factories.tourn.create();
			const Site = await factories.site.create({ tourn: Tourn.id });
			const Room = await factories.room.create({ site: Site.id });

			const room = await roomRepo.getRoom({
				roomId: Room.id,
				siteId: Site.id,
				tournId: Tourn.id,
			});

			expect(room).toBeDefined();
			expect(room.site).toBeUndefined();
		});
	});
	describe('getRooms', () => {
		it('filters by tournId when provided in scope', async () => {
			const tourn = await factories.tourn.create();
			const Site = await factories.site.create({ tourn: tourn.id });
			const room = await factories.room.create({ site:Site.id });
			await factories.room.create();

			const rooms = await roomRepo.getRooms({ tournId: tourn.id }, { include: { site: true } });

			expect(rooms).toBeDefined();
			expect(rooms.length).toBeGreaterThanOrEqual(1);
			rooms.forEach(r => {
				expect(r.site).not.toBeNull();
				expect(r.siteId).toBe(Site.id);
			});
			expect(rooms.map(r => r.id)).toEqual(expect.arrayContaining([room.id]));
		});
		it('applies both siteId and tournId filters together', async () => {
			const tourn = await factories.tourn.create();
			const Site1 = await factories.site.create({ tourn: tourn.id });
			const Site2 = await factories.site.create();
			const room = await factories.room.create({ site: Site1.id });
			await factories.room.create({ site: Site2.id });

			const rooms = await roomRepo.getRooms({ tournId: tourn.id, siteId: Site1.id }, { include: { site: true } });

			expect(rooms).toBeDefined();
			expect(rooms.length).toBeGreaterThanOrEqual(1);
			rooms.forEach(r => {
				expect(r.site).not.toBeNull();
				expect(r.site.id).toBe(Site1.id);
			});
			expect(rooms.map(r => r.id)).toEqual(expect.arrayContaining([room.id]));
		});
		it('retrieves all rooms for a given site', async () => {
			const Site = await factories.site.create();
			const room1 = await factories.room.create({ site: Site.id });
			const room2 = await factories.room.create({ site: Site.id });

			const results = await roomRepo.getRooms({ site: Site.id });
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThanOrEqual(2);
			results.forEach(s => {
				expect(s.siteId, `expected siteId to be ${Site.id} but was ${s.siteId}`).toBe(Site.id);
			});
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([room1.id, room2.id]));
		});
		it('retrieves all rooms when no scope is provided', async () => {
			const room1 = await factories.room.create();
			const room2 = await factories.room.create();

			const results = await roomRepo.getRooms();
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThanOrEqual(2);
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([room1.id, room2.id]));
		});
	});
	describe('roomInclude', () => {
		it('returns base room include config', () => {
			const inc = roomInclude();
			expect(inc.model).toBeDefined();
			expect(Array.isArray(inc.include)).toBe(true);
		});
	});
	describe('getRoom', () => {
		it('retrieves room by id', async () => {
			const roomData = factories.room.createRoomData();
			const room = await factories.room.create(roomData);
			const resultId = room.id;
			expect(resultId).toBeDefined();
			const result = await roomRepo.getRoom(resultId);
			expect(result).toBeDefined();
			expect(result.name).toBe(roomData.name);
		});
		it('retrieves room by scope object', async () => {
			const site = await factories.site.create();
			const roomData = factories.room.createRoomData({ siteId: site.id });
			const room = await factories.room.create(roomData);

			const result = await roomRepo.getRoom({ roomId: room.id, siteId: site.id });
			expect(result).toBeDefined();
			expect(result.id).toBe(room.id);
			expect(result.siteId).toBe(site.id);
		});
		it('throws an error when id is not provided', async () => {
			await expect(roomRepo.getRoom()).rejects.toThrow();
		});
		it('throws an error when scope object is missing roomId', async () => {
			await expect(roomRepo.getRoom({ siteId: 1 })).rejects.toThrow('getRoom: roomId is required');
		});
	});
	describe('createRoom', () => {
		it('creates room when provided valid data', async () => {
			const room = await factories.room.create();
			const result = await roomRepo.getRoom(room.id);
			expect(result).toBeDefined();
			expect(result.name).toBe(room.name);
			expect(result.tournId).toBe(room.tournId);
		});
	});
	describe('updateRoom', () => {
		it('updates room when provided valid data', async () => {
			const room = await factories.room.create();
			const newData = factories.room.createRoomData({quality: 12});
			const result = await roomRepo.updateRoom(room.id, newData);
			const updated = await roomRepo.getRoom(room.id);
			expect(result).toBe(true);
			expect(updated).toBeDefined();
			expect(updated.quality).toBe(12);
		});
		it('returns false when trying to update a non-existent room', async () => {
			const result = await roomRepo.updateRoom(999999, { name: 'Non-existent' }); // unlikely roomId
			expect(result).toBe(false);
		});
		it('throws an error when id is not provided', async () => {
			await expect(roomRepo.updateRoom(null, { name: 'No ID' })).rejects.toThrow('updateRoom: id is required');
		});
	});
	describe('deleteRoom', () => {
		it('deletes a room and returns true', async () => {
			// Arrange
			const room = await factories.room.create();
			// Act
			const result = await roomRepo.deleteRoom(room.id);
			// Assert
			expect(result).toBe(true);
			const deleted = await roomRepo.getRoom(room.id);
			expect(deleted).toBeNull();
		});
		it('returns false when trying to delete a non-existent room', async () => {
			const result = await roomRepo.deleteRoom(999999); // unlikely roomId
			expect(result).toBe(false);
		});
		it('throws an error when id is not provided', async () => {
			await expect(roomRepo.deleteRoom()).rejects.toThrow('deleteRoom: id is required');
		});
	});
});