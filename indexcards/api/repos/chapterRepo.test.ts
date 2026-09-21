import factories from '../../tests/factories/index.js';
import chapterRepo from './chapterRepo.js';
import { db } from '../../api/data/database.js';

describe('Chapter Repo', () => {
	describe('getAdmins', () => {
		it('should return admins for a chapter', async () => {
			const Chapter = await factories.chapter.create();
			const Person = await factories.person.create();
			await factories.permission.create({
				chapter: Chapter.id,
				person: Person.id,
				tag: 'chapter',
			});
			const admins = await chapterRepo.getAdmins(db,Chapter.id);
			expect(Array.isArray(admins)).toBe(true);
			expect(admins.length).toBe(1);
			expect(admins[0].id).toBe(Person.id);
		});
		it('should return an empty array when no admin exists', async () => {
			const Chapter = await factories.chapter.create();
			const admins = await chapterRepo.getAdmins(db, Chapter.id);
			expect(Array.isArray(admins)).toBe(true);
			expect(admins.length).toBe(0);
		});
	});
});