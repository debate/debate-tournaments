import factories from '../../tests/factories/index.js';
import { db } from '../data/database.js';
import studentRepo from './studentRepo.js';

describe('unlinkedSearch', () => {
	it('returns only students matching unlinked and filter criteria', async () => {
		const stamp = Date.now();
		const firstPrefix = `ULF${stamp}`;
		const lastPrefix = `ULL${stamp}`;
		const schoolYear = new Date().getFullYear();
		const Chapter = await factories.chapter.create();

		const included = await factories.student.create({
			first: `${firstPrefix}A`,
			last: `${lastPrefix}A`,
			chapter: Chapter.id,
		});

		const linkedByPerson = await factories.student.create({
			first: `${firstPrefix}B`,
			last: `${lastPrefix}B`,
			person: 123,
			chapter: Chapter.id,
		});

		const linkedByRequest = await factories.student.create({
			first: `${firstPrefix}C`,
			last: `${lastPrefix}C`,
			person_request: 321,
			chapter: Chapter.id,
		});

		await factories.student.create({
			first: `${firstPrefix}D`,
			last: `${lastPrefix}D`,
			chapter: Chapter.id,
		});

		await factories.student.create({
			first: `${firstPrefix}E`,
			last: `X${lastPrefix}`,
			chapter: Chapter.id,
		});

		const results = await studentRepo.unlinkedSearch(db,{
			first: firstPrefix,
			last: lastPrefix,
		}, {
			schoolYear,
		});

		expect(Array.isArray(results)).toBe(true);
		expect(results.some(s => s.id === included.id)).toBe(true);
		expect(results.some(s => s.id === linkedByPerson.id)).toBe(false);
		expect(results.some(s => s.id === linkedByRequest.id)).toBe(false);
		const includedResult = results.find(s => s.id === included.id);
		expect(includedResult).toBeDefined();
		expect(includedResult!.chapter_id).toBe(Chapter.id);
	});

	it('counts distinct tournaments for each matched student', async () => {
		const stamp = Date.now();
		const firstPrefix = `TCF${stamp}`;
		const lastPrefix = `TCL${stamp}`;
		const schoolYear = new Date().getFullYear();
		const Chapter = await factories.chapter.create();
		const Student = await factories.student.create({
			first: `${firstPrefix}Main`,
			last: `${lastPrefix}Main`,
			chapter: Chapter.id,
		});

		const tournA = await factories.tourn.create({ name: `Tourn A ${stamp}` });
		const tournB = await factories.tourn.create({ name: `Tourn B ${stamp}` });

		const eventA1 = await factories.event.create({ tourn: tournA.id, name: `EA1 ${stamp}` });
		const eventA2 = await factories.event.create({ tourn: tournA.id, name: `EA2 ${stamp}` });
		const eventB1 = await factories.event.create({ tourn: tournB.id, name: `EB1 ${stamp}` });

		const entryA1 = await factories.entry.create({ event: eventA1.id });
		const entryA2 = await factories.entry.create({ event: eventA2.id });
		const entryB1 = await factories.entry.create({ event: eventB1.id });

		await db.insertInto('entry_student')
		.values([
			{ entry: entryA1.id, student: Student.id },
			{ entry: entryA2.id, student: Student.id },
			{ entry: entryB1.id, student: Student.id }
		]).execute();

		const results = await studentRepo.unlinkedSearch(db,{
			first: firstPrefix,
			last: lastPrefix,
		}, {
			schoolYear,
		});

		const studentResult = results.find(s => s.id === Student.id);
		expect(studentResult).toBeDefined();
		expect(Number(studentResult!.tourn_count)).toBe(2);
	});
	it('defaults schoolYear to current year if not provided', async () => {
		const stamp = Date.now();
		const firstPrefix = `SYF${stamp}`;
		const lastPrefix = `SYL${stamp}`;
		const currentYear = new Date().getFullYear();
		const Chapter = await factories.chapter.create();
		const included = await factories.student.create({
			first: `${firstPrefix}A`,
			last: `${lastPrefix}A`,
			chapter: Chapter.id,
		});

		await factories.student.create({
			first: `${firstPrefix}B`,
			last: `${lastPrefix}B`,
			chapter: Chapter.id,
		});

		const results = await studentRepo.unlinkedSearch(db,{
			first: firstPrefix,
			last: lastPrefix,
		});

		expect(results.some(s => s.id === included.id)).toBe(true);
		expect(results.some(s => s.grad_year === currentYear - 1)).toBe(false);
	});
});
