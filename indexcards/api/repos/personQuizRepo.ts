import type { Database } from '../data/database.js';
import type { PersonQuiz } from '../data/schema.js';
import type { Insertable } from 'kysely';

type queryOpts = {
	limit?: number;
	offset?: number;
}
function buildPersonQuizQuery(db: Database, opts: queryOpts = {}) {

	let query = db.selectFrom('person_quiz');


	if (opts.limit) query = query.limit(Number(opts.limit));

	if (opts.offset) query = query.offset(Number(opts.offset));

	return query;
}

async function getPersonQuiz(db: Database,id:number, opts: queryOpts = {}) {
	return await buildPersonQuizQuery(db, opts).where('id', '=', id).executeTakeFirst();
} 

async function createPersonQuiz(db: Database, data: Insertable<PersonQuiz>) {
	return await db.insertInto('person_quiz')
	.values(data)
	.returningAll()
	.executeTakeFirstOrThrow();
}

export default {
	createPersonQuiz,
	getPersonQuiz,
};