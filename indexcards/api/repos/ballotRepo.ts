import type { Database } from '../data/database.js';
import type { Insertable } from 'kysely';
import type { Ballot } from '../data/schema.js';

type queryOpts = {
	winnerBallot?: boolean;
	panel?: number
};
function buildBallotQuery(db: Database, opts: queryOpts = {}){
	let query  = db.selectFrom('ballot');

	query = opts.panel ? query.where('panel', '=', opts.panel) : query;
	if (opts.winnerBallot) {
		const existing = query.include.find(i => i.as === 'scores');

		if (existing) {
			existing.required = true;
			existing.where = {
				...existing.where,
				tag: 'winloss',
				value: 1,
			};
		} else {
			query.include.push({
				model: db.score,
				as: 'ballot_scores',
				attributes: [],
				required: true,
				where: {
					tag: 'winloss',
					value: 1,
				},
			});
		}
	}

	return query;
}

export async function getBallot(db: Database, id: number, opts: queryOpts = {}) {
	return await buildBallotQuery(db, opts)
	.selectAll('ballot')
	.where('ballot.id', '=', id)
	.executeTakeFirst();
}

export async function getBallots(db: Database, opts: queryOpts = {}) {
	return await buildBallotQuery(db, opts)
	.selectAll('ballot')
	.execute();
}
export async function createBallot(db: Database, data: Insertable<Ballot> = {}){
	return await db.insertInto('ballot')
	.values(data)
	.returningAll()
	.executeTakeFirst();
}

export default {
	getBallot,
	getBallots,
	createBallot,
};