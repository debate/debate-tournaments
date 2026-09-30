import { sql } from 'kysely';
import db from '../../../data/db.js';
import { db as kdb } from '../../../data/database.js';
export async function cleanRoundEmpties(req, res) {
	const allPromises = [];

	const { rows: duplicateBallots } = await sql`
		select
				b2.id
		from ballot b1 FORCE INDEX (panel), ballot b2 FORCE INDEX (panel), panel
		where 1=1
				and panel.round = ${req.params.roundId}
				and panel.id = b1.panel
				and panel.id = b2.panel
				and b1.entry = b2.entry
				and b1.judge IS NULL
				and b2.judge IS NULL
				and b1.id < b2.id
	`.execute(kdb);

	const deleteBallotQuery = ` delete from ballot where id = :ballotId`;
	let description = ``;

	if (duplicateBallots.length > 0) {

		description += `Removed ${duplicateBallots.length} duplicate null ballots`;

		duplicateBallots.forEach( (ballot) => {

			const promise = db.sequelize.query(
				deleteBallotQuery,
				{
					type: db.sequelize.QueryTypes.DELETE,
					replacements: { ballotId: ballot.id },
				}
			);

			allPromises.push(promise);
		});
	}

	const { rows: emptySections } = await sql`
		select panel.id
		from panel
		where panel.round = ${req.params.roundId}
		and not exists (
			select ballot.id
			from ballot
			where ballot.panel = panel.id
		)
	`.execute(kdb);

	const deleteSectionQuery = ` delete from panel where id = :sectionId`;

	if (emptySections.length > 0) {

		if (description) {
			description += `\n`;
		}

		description += `Removed ${emptySections.length} sections without ballot records`;

		emptySections.forEach( (section) => {

			const promise = db.sequelize.query(
				deleteSectionQuery,
				{
					type: db.sequelize.QueryTypes.DELETE,
					replacements: { sectionId: section.id },
				}
			);

			allPromises.push(promise);
		});
	}

	if (description) {
		await db.ChangeLog.create({
			person      : req.session.person,
			round       : req.params.roundId,
			description,
		});
	}

	await Promise.all(allPromises);

	return res.status(200).json(description);
};