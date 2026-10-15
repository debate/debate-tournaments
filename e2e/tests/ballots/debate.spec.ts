import { test, expect, API_URL, APP_ORIGIN, type TestPerson } from '../fixtures.js';
import factories from '../../../indexcards/tests/factories/index.js';
import { db } from '../../../indexcards/api/data/database.js';

// An unscored LD prelim counting wins and points, judged by the person: AFF1 (Ana Adams) on Aff,
// NEG2 (Ben Brown) on Neg. The tournament hasn't ended, so it's on the judge's home page and
// feedback stays open; the round is published, and the event takes online ballots
const createDebateBallot = async (person: TestPerson) => {
	const tourn = await factories.tourn.create({
		name: `Ballot Invitational ${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`,
		tz: 'America/Chicago',
		end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
	});
	const category = await factories.category.create({ tourn: tourn.id });
	const event = await factories.event.create({ tourn: tourn.id, category: category.id, type: 'debate', abbr: 'LD', settings: { online_ballots: '1' } });
	const timeslot = await factories.timeslot.create({ tourn: tourn.id });
	const protocol = await factories.protocol.create({ tourn: tourn.id, tiebreaks: ['winloss', 'points'] });
	const round = await factories.round.create({
		event: event.id,
		timeslot: timeslot.id,
		protocol: protocol.id,
		type: 'prelim',
		name: 1,
		published: 1,
		start_time: new Date(),
	});
	const panel = await factories.panel.create({ round: round.id });
	const judge = await factories.judge.create({ person: person.id, category: category.id });

	const ana = await factories.student.create({ first: 'Ana', middle: null, last: 'Adams' });
	const ben = await factories.student.create({ first: 'Ben', middle: null, last: 'Brown' });
	const aff = await factories.entry.create({ event: event.id, code: 'AFF1', students: [ana.id] });
	const neg = await factories.entry.create({ event: event.id, code: 'NEG2', students: [ben.id] });
	const affBallot = await factories.ballot.create({ judge: judge.id, panel: panel.id, entry: aff.id, side: 1 });
	const negBallot = await factories.ballot.create({ judge: judge.id, panel: panel.id, entry: neg.id, side: 2 });

	return { tournName: tourn.name!, judge: judge.id, panel: panel.id, ana: ana.id, ben: ben.id, affBallot: affBallot.id, negBallot: negBallot.id };
};

test('a judge fixes a refused debate ballot, then confirms it', async ({ page, person, login }) => {
	const ballot = await createDebateBallot(person);

	// From the judge's home page, through the round's card on the tournament
	await login(person);
	await page.goto('/user/home');
	await expect(page.getByText(ballot.tournName, { exact: true })).toBeVisible();
	await page.getByRole('link', { name: 'Start Round' }).click();
	await expect(page).toHaveURL(url => url.pathname === '/user/judge/ballot'
		&& url.searchParams.get('judgeId') === String(ballot.judge)
		&& url.searchParams.get('panelId') === String(ballot.panel));

	const points = (name: string) => page.getByRole('spinbutton', { name: `Points for ${name}` });
	const submit = page.getByRole('button', { name: 'Submit Ballot' });
	const errors = page.getByRole('alert').filter({ hasText: 'Oh, drat. Your ballot had errors.' });

	// Wrong: points over the 30 maximum, and the winner on the wrong side
	await points('Ana Adams').fill('29');
	await points('Ben Brown').fill('31');
	await page.getByRole('combobox', { name: 'Winner' }).selectOption({ label: 'AFF1' });
	await page.getByRole('radio', { name: 'Neg' }).check();
	await submit.click();

	await expect(errors).toBeVisible();
	await expect(errors).toContainText('Your winner and your chosen side did not agree: AFF1 was Aff.');
	await expect(errors).toContainText('Points 31 are outside of range 0 - 30.');

	// Nothing was saved
	expect(await db.selectFrom('score').select('id').where('ballot', 'in', [ballot.affBallot, ballot.negBallot]).where('tag', 'in', ['winloss', 'point']).execute()).toEqual([]);

	// Any edit clears the errors
	await points('Ben Brown').fill('28');
	await expect(errors).toBeHidden();

	await page.getByRole('radio', { name: 'Aff' }).check();
	await submit.click();

	// The saved ballot, for the judge to check
	const dialog = page.getByRole('dialog', { name: 'Is this correct?' });
	await expect(dialog).toBeVisible();
	await expect(dialog).toContainText('Winner: AFF1 (Aff)');
	await expect(dialog).toContainText('Ana Adams: 29');
	await expect(dialog).toContainText('Ben Brown: 28');

	await dialog.getByRole('button', { name: 'Yes, confirm' }).click();

	const confirmed = page.getByText('This ballot has been entered and confirmed already.');
	await expect(confirmed).toBeVisible();
	await expect(dialog).toBeHidden();

	// Confirmed by classic (the e2e stand-in) with the judge's session, and the scores as entered
	const ballots = await db.selectFrom('ballot').select(['id', 'audit', 'entered_by'])
		.where('id', 'in', [ballot.affBallot, ballot.negBallot]).orderBy('id').execute();
	expect(ballots).toEqual([
		{ id: ballot.affBallot, audit: 1, entered_by: person.id },
		{ id: ballot.negBallot, audit: 1, entered_by: person.id },
	]);

	const scores = await db.selectFrom('score').select(['ballot', 'student', 'tag', 'value'])
		.where('ballot', 'in', [ballot.affBallot, ballot.negBallot]).where('tag', 'in', ['winloss', 'point'])
		.orderBy('tag').orderBy('ballot').execute();
	expect(scores).toEqual([
		{ ballot: ballot.affBallot, student: ballot.ana, tag: 'point', value: 29 },
		{ ballot: ballot.negBallot, student: ballot.ben, tag: 'point', value: 28 },
		{ ballot: ballot.affBallot, student: 0, tag: 'winloss', value: 1 },
		{ ballot: ballot.negBallot, student: 0, tag: 'winloss', value: 0 },
	]);

	// The API and a fresh load agree it's final
	const status = await page.request.get(`${API_URL}/v1/rest/judges/${ballot.judge}/panels/${ballot.panel}/ballots/status`, {
		headers: { origin: APP_ORIGIN },
	});
	expect(status.status()).toBe(200);
	expect(await status.json()).toMatchObject({ status: 'confirmed' });

	await page.reload();
	await expect(confirmed).toBeVisible();
	await expect(submit).toBeHidden();
});
