import factories from '../../../tests/factories/index.js';
import { judgeRecord } from './judgeRecords';
import db from '../../data/db.js';
describe('Judge Record Service', async () => {
	let personId,judgeId, tournId, roundId, panelId, eventId;
	let entryId;
	beforeAll(async () => {
		({ id: personId } = await factories.person.create());
		({ id: judgeId } = await factories.judge.create({ person: personId }));
		({ id: tournId } = await factories.tourn.create({ hidden: 0 })); //public tourn
		({ id: eventId } = await factories.event.create({ tournId }));
		({ id: roundId } = await factories.round.create({
			event: eventId,
			published: true,
			post_primary: 3,
		})); //published round with public primary results
		({ id: panelId } = await factories.panel.create({ round: roundId }));
		const entry = await db.entry.create({
			event: eventId,
			tourn: tournId,
			code: 'AFF1',
		});
		entryId = entry.id;
	});
	it('returns the public judging record of a person', async () => {
		const ballot = await factories.ballot.create({
			section: panelId,
			judge: judgeId,
			entry: entryId,
			side: 1,
		});
		const { scoreId } = await factories.score.create({
			ballot: ballot.id,
			tag: 'winloss',
			value: 1,
		});
		const res = await judgeRecord(personId);

		expect(scoreId).toBeDefined();
		expect(Array.isArray(res)).toBe(true);
		expect(res.length).toBeGreaterThan(0);
		expect(res[0].affTeam).toBe('AFF1');
	});
});