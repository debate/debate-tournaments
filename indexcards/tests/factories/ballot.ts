import ballotRepo from '../../api/repos/ballotRepo.js';
import factories from './index.js';
import { db } from '../../api/data/database.js';

export function buildBallotData(overrides = {}) {
	return {
		speakerorder: 0,
		chair: 0,
		...overrides,
	};
}

export async function create(overrides = {}) {
	let panelId = overrides.panel;

	if (!overrides.panel) {
		const panel = await factories.panel.create();
		panelId = panel.id;
	}

	const data = buildBallotData({
		...overrides,
		panel: panelId,
	});

	return await ballotRepo.createBallot(db,data);
}

export default {
	create,
};
