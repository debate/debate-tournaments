import { sql } from 'kysely';
import { db as kdb } from '../../../data/database.js';

export async function updateLastAccess(req,res) {
	if (req.session?.Su) {
		return res.status(200).json({
			message     : 'Update skipped; SU session',
			last_access : req.session.last_access,
		});
	}

	// Only need to update this once a day or so.
	const last = Date.parse(req.session.last_access);
	const now  = new Date();
	const then = now.setDate(now.getDate() - 1);

	let response = {};

	if (
		(Number.isNaN(last) || last < then)
		|| req.query.forceUpdate
	) {
		response = await kdb.updateTable('session')
			.set({ last_access: sql`NOW()` })
			.where('session.id', '=', req.session.id)
			.execute();

		response = {
			message: 'Update performed',
			last_access: new Date(),
		};

	} else {
		response = {
			message: 'Update unnecessary',
			last_access: req.session.last_access,
		};
	}

	return res.status(200).json(response);
};

export default updateLastAccess;
