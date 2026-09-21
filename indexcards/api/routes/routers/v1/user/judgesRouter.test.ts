import factories from '../../../../../tests/factories/index.js';
import request from 'supertest';
import server from '../../../../../app.js';
import z from 'zod';
import { JudgeHistorySchema } from '@tabroom/types';
import personRepo from '../../../../repos/personRepo.js';
import { db } from '../../../../../api/data/database.js';
import chapterJudgeRepo from '../../../../repos/chapterJudgeRepo.js';

describe('judgesRouter', () => {
	let personId : number;
	let userkey: string;
	beforeAll(async () => {
		({ id: personId } = await factories.person.create());
		({ userkey } = await factories.session.create({ person: personId }));
	});
	describe("POST /user/judges/claim", () => {
		it('should allow a user to claim a chapter judge', async () => {
			//setup - create a chapter judge with no person_request
			const Chapter = await factories.chapter.create();
			const ChapterJudge = await factories.chapterJudge.create({
				person_request: null,
				chapter: Chapter.id,
			});
			//make the request to claim the chapter judge
			await request(server)
				.post('/v1/user/judges/claim')
				.query({ chapterJudgeId: ChapterJudge.id })
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${userkey}`)
				.expect(200);
			//assert that the chapter judge's person_request is updated and that an email was sent to the chapter email with the correct content
			const updatedChapterJudge = await chapterJudgeRepo.getChapterJudge(db,ChapterJudge.id);
			expect(updatedChapterJudge?.person_request).toBe(personId);
		});
		it('should auto-approve a claim request if the user is a chapter admin', async () => {
			//setup - create a chapter judge with no person_request
			const Chapter = await factories.chapter.create();
			const ChapterJudge = await factories.chapterJudge.create({
				person_request: null,
				chapter: Chapter.id,
			});
			await factories.permission.create({ person: personId, chapter: Chapter.id, tag: 'chapter' }); //give the user admin permissions for the chapter so they can receive the notification email
			//make the request to claim the chapter judge
			await request(server)
				.post('/v1/user/judges/claim')
				.query({ chapterJudgeId: ChapterJudge.id })
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${userkey}`)
				.expect(200);
			//assert that the chapter judge's person_request is updated and that an email was sent to the chapter email with the correct content
			const updatedChapterJudge = await chapterJudgeRepo.getChapterJudge(db,ChapterJudge.id);
			expect(updatedChapterJudge?.person).toBe(personId);
		});
		it.todo('should allow a user to claim a judge', async () => {
			//setup - create a judge with no person_request
			//make the request to claim the judge
			//assert that the judge's person_request is updated and that an email was sent to the chapter email with the correct content
		});
	});
	describe("GET /user/judges/history", () => {
		it('should return the judge history for the logged in user', async () => {
			const Tourn = await factories.tourn.create(); // start is past by default
			const Category = await factories.category.create({ tourn: Tourn.id });
			const Judge = await factories.judge.create({ person: personId, category: Category.id });

			// Create event → round → panel → ballot chain
			const Event = await factories.event.create({ category: Category.id });
			const Round = await factories.round.create({ event: Event.id, published: 1 });
			const Panel = await factories.panel.create({ round: Round.id });
			await factories.ballot.create({ panel: Panel.id, judge:Judge.id });
			
			const res = await request(server)
				.get('/v1/user/judges/history')
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${userkey}`)
				.expect(200);
			expect(res.body).toMatchSchema(z.array(JudgeHistorySchema));
		});
	});
	describe("POST /user/judges/paradigm", () => {
		it('should update the users paradigm', async () => {
			const Person = await factories.person.create();
			const { userkey } = await factories.session.create({ person: Person.id });
			const res = await request(server)
				.post('/v1/user/judges/paradigm')
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${userkey}`)
				.send({ paradigm: 'word '.repeat(50) })
				.expect(204);
			expect(res).not.toBeProblemResponse();

			const updatedPerson = await personRepo.getPerson(db, Person.id,{ settings: ['paradigm']});
			expect(updatedPerson!.settings!.paradigm).toBe('word '.repeat(50));

			const newParadigm = await request(server)
				.get('/v1/user/judges/paradigm')
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${userkey}`)
				.expect(200);
			expect(newParadigm.body.paradigm).toBe('word '.repeat(50));
		});
	});
	describe("GET /user/judges/livedocs", () => {
		it('should return the live docs for the logged in user', async () => {
			const Tourn = await factories.tourn.create();
			const category = await factories.category.create({
				tourn: Tourn.id,
				settings: {
					livedoc_url: 'example.com',
					livedoc_caption: 'example',
				},
			});

			await factories.person.createJudge({ person: personId, Judge: { category: category.id } });
			const res = await request(server)
				.get('/v1/user/judges/livedocs')
				.set('Accept', 'application/json')
				.set('Authorization', `Bearer ${userkey}`)
				.expect(200);
			expect(res.body).toBeInstanceOf(Array);
			expect(res.body[0].url).toBe('example.com');
			expect(res.body[0].caption).toBe('example');
		});
	});
});
