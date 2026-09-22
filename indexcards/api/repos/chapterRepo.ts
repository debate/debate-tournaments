import type { Insertable } from 'kysely';
import type { Database } from '../data/database.js';
import type { Chapter } from '../data/schema.js';

type queryOpts = {

}
function buildChapterQuery(db: Database, opts: queryOpts = {}) {
	const query = db.selectFrom('chapter');

	return query;
}

async function getChapter(db:Database, id:number, opts: queryOpts = {}) {
	return await buildChapterQuery(db, opts)
	.where('id', '=', id)
	.selectAll('chapter')
	.executeTakeFirst();
}

async function createChapter(db: Database, data: Insertable<Chapter>) {
	return await db.insertInto('chapter')
		.values(data)
		.returningAll()
		.executeTakeFirstOrThrow();
}

async function getAdmins(db: Database, chapterId: number) {
	return await db.selectFrom('person')
		.innerJoin('permission', 'person.id', 'permission.person')
		.where('permission.chapter', '=', chapterId)
		.where('permission.tag', '=', 'chapter')
		.selectAll('person')
		.execute();
}

export default {
	getChapter,
	createChapter,
	getAdmins,
};
