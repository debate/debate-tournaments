import factories from '../../tests/factories/index.js';
import db from '../data/db.js';
import studentRepo from './studentRepo.js';

describe('unlinkedSearch', () => {
	it('returns only students matching unlinked and filter criteria', async () => {
		const stamp = Date.now();
		const firstPrefix = `ULF${stamp}`;
		const lastPrefix = `ULL${stamp}`;
		const schoolYear = new Date().getFullYear();
		const { chapterId } = await factories.chapter.create();

		const included = await factories.student.create({
			first: `${firstPrefix}A`,
			last: `${lastPrefix}A`,
			chapter: chapterId,
		});

		const linkedByPerson = await factories.student.create({
			first: `${firstPrefix}B`,
			last: `${lastPrefix}B`,
			person: 123,
			chapter: chapterId,
		});

		const linkedByRequest = await factories.student.create({
			first: `${firstPrefix}C`,
			last: `${lastPrefix}C`,
			person_request: 321,
			chapter: chapterId,
		});

		await factories.student.create({
			first: `${firstPrefix}D`,
			last: `${lastPrefix}D`,
			chapter: chapterId,
		});

		await factories.student.create({
			first: `${firstPrefix}E`,
			last: `X${lastPrefix}`,
			chapter: chapterId,
		});

		const results = await studentRepo.unlinkedSearch({
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
		expect(includedResult.chapter_id).toBe(chapterId);
	});

	it('counts distinct tournaments for each matched student', async () => {
		const stamp = Date.now();
		const firstPrefix = `TCF${stamp}`;
		const lastPrefix = `TCL${stamp}`;
		const schoolYear = new Date().getFullYear();
		const { chapterId } = await factories.chapter.create();
		const student = await factories.student.create({
			first: `${firstPrefix}Main`,
			last: `${lastPrefix}Main`,
			chapter: chapterId,
		});

		const tournA = await factories.tourn.create({ name: `Tourn A ${stamp}` });
		const tournB = await factories.tourn.create({ name: `Tourn B ${stamp}` });

		const { eventId: eventA1 } = await factories.event.create({ tourn: tournA.id, name: `EA1 ${stamp}` });
		const { eventId: eventA2 } = await factories.event.create({ tourn: tournA.id, name: `EA2 ${stamp}` });
		const { eventId: eventB1 } = await factories.event.create({ tourn: tournB.id, name: `EB1 ${stamp}` });

		const entryA1 = await factories.entry.create({ event: eventA1 });
		const entryA2 = await factories.entry.create({ event: eventA2 });
		const entryB1 = await factories.entry.create({ event: eventB1 });

		await db.entryStudent.create({ entry: entryA1.id, student: student.id });
		await db.entryStudent.create({ entry: entryA2.id, student: student.id });
		await db.entryStudent.create({ entry: entryB1.id, student: student.id });

		const results = await studentRepo.unlinkedSearch({
			first: firstPrefix,
			last: lastPrefix,
		}, {
			schoolYear,
		});

		const studentResult = results.find(s => s.id === student.id);
		expect(studentResult).toBeDefined();
		expect(Number(studentResult.tourn_count)).toBe(2);
	});

	it('throws an error if required parameters are missing', async () => {
		await expect(studentRepo.unlinkedSearch({})).rejects.toThrow('unlinkedSearch requires first and last parameters');
		await expect(studentRepo.unlinkedSearch({ first: 'Test' })).rejects.toThrow('unlinkedSearch requires first and last parameters');
		await expect(studentRepo.unlinkedSearch({ last: 'Test' })).rejects.toThrow('unlinkedSearch requires first and last parameters');
	});
	it('defaults schoolYear to current year if not provided', async () => {
		const stamp = Date.now();
		const firstPrefix = `SYF${stamp}`;
		const lastPrefix = `SYL${stamp}`;
		const currentYear = new Date().getFullYear();
		const { chapterId } = await factories.chapter.create();
		const included = await factories.student.create({
			first: `${firstPrefix}A`,
			last: `${lastPrefix}A`,
			chapter: chapterId,
		});

		await factories.student.create({
			first: `${firstPrefix}B`,
			last: `${lastPrefix}B`,
			chapter: chapterId,
		});

		const results = await studentRepo.unlinkedSearch({
			first: firstPrefix,
			last: lastPrefix,
		});

		expect(results.some(s => s.id === included.id)).toBe(true);
		expect(results.some(s => s.grad_year === currentYear - 1)).toBe(false);
	});
});
