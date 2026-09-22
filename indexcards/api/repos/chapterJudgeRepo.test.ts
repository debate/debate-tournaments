import chapterJudgeRepo from './chapterJudgeRepo.js';
import factories from '../../tests/factories/index.js';
import { db } from '../data/database.js';

describe('chapterJudgeRepo', () => {
	describe('unlinkedSearch', () => {

		it('returns unlinked chapter judges with chapter name and tourn count', async () => {
			const cj = await factories.chapterJudge.create();
			const chapterJudgeId = cj.id;

			const tourn = await factories.tourn.create();
			const category = await factories.category.create({ tourn: tourn.id });
			await factories.judge.create({ chapter_judge: chapterJudgeId, category: category.id });

			const results = await chapterJudgeRepo.unlinkedSearch(db,{ first: cj.first, last: cj.last });

			const found = results.find(r => r.id === chapterJudgeId);
			expect(found).toBeDefined();
			expect(found!.first).toBe(cj.first);
			expect(found!.last).toBe(cj.last);
			expect(found!.chapter_name).toBeDefined();
			expect(Number(found!.tourn_count)).toBeGreaterThanOrEqual(1);
		});

		it('counts distinct tournaments across multiple judge records', async () => {
			const cj = await factories.chapterJudge.create();
			const chapterJudgeId = cj.id;

			const tourn1 = await factories.tourn.create();
			const tourn2 = await factories.tourn.create();
			const cat1 = await factories.category.create({ tourn: tourn1.id });
			const cat2 = await factories.category.create({ tourn: tourn2.id });

			await factories.judge.create({ chapter_judge: chapterJudgeId, category: cat1.id });
			await factories.judge.create({ chapter_judge: chapterJudgeId, category: cat2.id });

			const results = await chapterJudgeRepo.unlinkedSearch(db,{ first: cj.first, last: cj.last });

			const found = results.find(r => r.id === chapterJudgeId);
			expect(found).toBeDefined();
			expect(Number(found!.tourn_count)).toBeGreaterThanOrEqual(2);
		});

		it('excludes rows requested by the excluded person', async () => {
			const requesterId = (await factories.person.create()).id;
			const otherRequesterId = (await factories.person.create()).id;

			const included = await factories.chapterJudge.create({
				first: 'River',
				last: 'Unlinked',
				person_request: otherRequesterId,
			});
			const excluded = await factories.chapterJudge.create({
				first: 'River',
				last: 'Unlinked',
				person_request: requesterId,
			});

			const results = await chapterJudgeRepo.unlinkedSearch(db,{
				first: 'River', last: 'Unlinked' },
				{ notRequestedBy: requesterId }
			);

			const resultIds = results.map(r => r.id);
			expect(resultIds).toContain(included.id);
			expect(resultIds).not.toContain(excluded.id);
		});

		it('includes chapter judges with no person_request when notRequestedBy is set', async () => {
			const requester = await factories.person.create();

			const cj = await factories.chapterJudge.create({
				first: 'Morgan',
				last: 'Norequest',
				person_request: null,
			});

			const results = await chapterJudgeRepo.unlinkedSearch(db,{
				first: 'Morgan', last: 'Norequest' },
				{ notRequestedBy: requester.id }
			);

			expect(results.map(r => r.id)).toContain(cj.id);
		});
	});
});
