import scoreRepo from '../../api/repos/scoreRepo.js';
import { create as createBallot } from './ballot.js';
import { db } from '../../api/data/database.js';

export function buildScoreData(overrides = {}) {
	return {
		...overrides,
	};
}

export async function create(overrides: Parameters<typeof scoreRepo.createScore>[1] = {}) {
	let ballot = overrides.ballot;
	let Ballot = null;

	if (!ballot) {
		Ballot = await createBallot(overrides);
		ballot = Ballot.id;
	}

	const data = buildScoreData({
		tag: 'winloss',
		value: 1,
		...overrides,
		ballot,
	});

	const Score = await scoreRepo.createScore(db, data);

	return {
		Score,
		Ballot: Ballot ?? ballot,
	};
}

export default {
	buildScoreData,
	create,
};

