import siteRepo from './siteRepo.js';
import factories from '../../tests/factories/index.js';
import { db } from '../data/database.js';

describe('SiteRepo', () => {
	describe('getSite', () => {
		it('retrieves site by id', async () => {
			const site = await factories.site.create();
			const result = await siteRepo.getSite(db, site.id);
			expect(result).toBeDefined();
			expect(result?.name).toBe(site.name);
		});
		it('retrieves site with tournId and filters by tournId in scope', async () => {
			const tourn = await factories.tourn.create();
			const site = await factories.site.create({ tourn: tourn.id });

			const result = await siteRepo.getSite(db, site.id,{ tourn: tourn.id });
			expect(result).toBeDefined();
			expect(result?.id).toBe(site.id);
		});
	});
	describe('getSites', () => {
		it('retrieves all sites for a given circuit', async () => {
			const { circuitId } = await factories.circuit.createTestCircuit();
			const site1 = await factories.site.create({ circuit: circuitId });
			const site2 = await factories.site.create({ circuit: circuitId });

			const results = await siteRepo.getSites(db, { circuit: circuitId });
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThanOrEqual(2);
			results.forEach(s => {
				expect(s.circuit, `expected circuitId to be ${circuitId} but was ${s.circuit}`).toBe(circuitId);
			});
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([site1.id, site2.id]));
		});
		it('retrieves all sites for a given tourn', async () => {
			const tourn = await factories.tourn.create();
			const site1 = await factories.site.create({ tourn: tourn.id });
			const site2 = await factories.site.create({ tourn: tourn.id });

			const results = await siteRepo.getSites(db, { tourn: tourn.id });
			expect(results).toBeDefined();
			expect(results.length).toBe(2);
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([site1.id, site2.id]));

		});
		it('retrieves all sites when no scope is provided', async () => {
			const site1 = await factories.site.create();
			const site2 = await factories.site.create();

			const results = await siteRepo.getSites(db);
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThanOrEqual(2);
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([site1.id, site2.id]));
		});
	});
	describe('createSite', () => {
		it('creates site when provided valid data', async () => {
			const site = factories.site.createSiteData();
			const result = await siteRepo.createSite(db, site);
			expect(result).toBeDefined();
			const fetched = await siteRepo.getSite(db, result?.id as number);
			expect(fetched).toBeDefined();
			expect(fetched?.name).toBe(site.name);
		});
	});
	describe('updateSite', () => {
		it('updates site when provided valid data', async () => {
			const site = await factories.site.create();
			const newData = factories.site.createSiteData({name: 'new site name'});
			const result = await siteRepo.updateSite(db, site.id, newData);
			const updated = await siteRepo.getSite(db, site.id);
			expect(result).toBe(true);
			expect(updated).toBeDefined();
			expect(updated?.name).toBe('new site name');
		});
	});
	describe('deleteSite', () => {
		it('deletes a site and returns true', async () => {
			const site = await factories.site.create();
			await siteRepo.deleteSite(db, site.id);
			const deleted = await siteRepo.getSite(db, site.id);
			expect(deleted).toBeUndefined();
		});
	});
});