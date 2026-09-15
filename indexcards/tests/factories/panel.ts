import panelRepo from '../../api/repos/panelRepo.js';
import { db } from '../../api/data/database.js';

export function createPanelData(overrides = {}) {
	return {
		publish: 3,
		...overrides,
	};
}

export async function create(overrides = {}) {
	const data = createPanelData(overrides);
	return await panelRepo.createPanel(db, data);
}
export default {
	createPanelData,
	create,
};