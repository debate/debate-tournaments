import siteRepo from '../../api/repos/siteRepo.js';
import tournRepo from '../../api/repos/tournRepo.js';
import { fakeSchoolName } from './factoryUtils.js';
import { db } from '../../api/data/database.js';
import type { Site } from '../../api/data/schema.js';
import type { Insertable } from 'kysely';

export function createSiteData(overrides = {}) {
	return {
		name: fakeSchoolName(),
		...overrides,
	};
}

export async function create(overrides: Partial<Insertable<Site>> & { tourn?: number } = {}) {
	const { tourn, ...siteOverrides } = overrides;
	const data = createSiteData(siteOverrides);

	const site = await siteRepo.createSite(db,data);
	if (!site) throw new Error('Failed to create site');

	if (tourn) {
		await tournRepo.addSite(db, tourn, site.id);
	}

	return site;
}
export default {
	createSiteData,
	create,
};
