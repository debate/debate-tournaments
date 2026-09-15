import type { Database } from '../data/database.js';
import type { Quiz } from '../data/schema.js';
import type { Insertable } from 'kysely';

type queryOpts = {
	limit?: number;
	offset?: number;
};
function buildQuizQuery(db: Database, opts: queryOpts = {}) {
	let query = db.selectFrom('quiz');

	if (opts.limit) query = query.limit(Number(opts.limit));
	if (opts.offset) query = query.offset(Number(opts.offset));

	return query;
}

async function getQuizzes(db: Database, opts: queryOpts = {}) {
	return await buildQuizQuery(db,opts)
	.selectAll('quiz')
	.execute();
}

async function createQuiz(db: Database, data: Insertable<Quiz>) {
	return await db.insertInto('quiz')
	.values(data)
	.returningAll()
	.executeTakeFirstOrThrow();
} 

export default {
	getQuizzes,
	createQuiz,
};