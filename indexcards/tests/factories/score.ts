import scoreRepo from '../../api/repos/scoreRepo.js';
import { create as createBallot } from './ballot.js';
import { db } from '../../api/data/database.js';

export function buildScoreData(overrides = {}) {
	return {
		...overrides,
	};
}

export async function create(overrides = {}) {
	let ballot = overrides.ballot;
	let getBallot = null;

	if (!ballot) {
		const Ballot = await createBallot(overrides);
		ballot = Ballot.ballotId;
		getBallot = Ballot.getBallot;
	}

	const data = buildScoreData({
		tag: 'winloss',
		value: 1,
		...overrides,
		ballot,
	});

	const score = await scoreRepo.createScore(db, data);

	return {
		score,
		ballotId: ballot,
		getBallot,
	};
}

export default {
	buildScoreData,
	create,
};

