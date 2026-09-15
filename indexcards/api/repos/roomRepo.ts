import type { Database } from '../data/database.js';

type queryOpts = {
	tourn?: number;
	site?: number;
}
function buildRoomQuery(db: Database, opts: queryOpts = {}) {
	let query = db.selectFrom('room'); 

	if (opts.tourn) {
		query = query.innerJoin('tourn_site', 'room.site', 'tourn_site.site')
		.where('tourn_site.tourn', '=', opts.tourn);
	}
	if (opts.site) {
		query = query.where('site', '=', opts.site);
	}

	return query;
}

async function getRoom(db: Database, id: number, opts: queryOpts = {}) {
	return await buildRoomQuery(db, opts)
	.where('room.id', '=', id)
	.selectAll('room')
	.executeTakeFirst();
}

async function getRooms(db: Database, opts: queryOpts = {}) {
	return await buildRoomQuery(db, opts)
	.selectAll('room')
	.execute();
}

async function createRoom(roomData) {
	const persistenceData = toPersistence(roomData);
	const newRoom = await db.room.create(persistenceData);
	return newRoom.id;
}

async function updateRoom(id, roomData) {
	if (!id) throw new Error('updateRoom: id is required');
	const persistenceData = toPersistence(roomData);
	const [rows] = await db.room.update(persistenceData, { where: { id } });
	return rows > 0;
}

async function deleteRoom(id) {
	if (!id) throw new Error('deleteRoom: id is required');
	const rows = await db.room.destroy({ where: { id } });
	return rows > 0;
}

export default {
	getRoom,
	getRooms,
	createRoom,
	updateRoom,
	deleteRoom,
};