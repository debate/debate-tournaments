import { BallotProgressSchema } from '@tabroom/types';
import config from '../../../../config.js';
import { db } from '../../../../data/database.js';
import { updateBallots } from '../../../../repos/ballotRepo.js';
import factories from '../../../../../tests/factories/index.js';
import { createPersonContext } from '../../../../../tests/httpMocks.js';
import { confirmBallotScores } from './ballotController.js';

// A judge's two ballots on a debate panel, unscored and unconfirmed, and the judge's login session
const createPanel = async () => {
	const person = await factories.person.create();
	const session = await factories.session.create({ person: person.id });
	const tourn = await factories.tourn.create();
	const category = await factories.category.create({ tourn: tourn.id });
	const event = await factories.event.create({ tourn: tourn.id, category: category.id, type: 'debate' });
	const timeslot = await factories.timeslot.create({ tourn: tourn.id });
	const round = await factories.round.create({ event: event.id, timeslot: timeslot.id, type: 'prelim' });
	const panel = await factories.panel.create({ round: round.id });
	const judge = await factories.judge.create({ person: person.id, category: category.id });

	const aff = await factories.entry.create({ event: event.id, code: 'AFF1' });
	const neg = await factories.entry.create({ event: event.id, code: 'NEG2' });
	const affBallot = await factories.ballot.create({ judge: judge.id, panel: panel.id, entry: aff.id, side: 1 });
	const negBallot = await factories.ballot.create({ judge: judge.id, panel: panel.id, entry: neg.id, side: 2 });

	return { person, session, judge: judge.id, panel: panel.id, ids: [affBallot.id, negBallot.id] };
};

type Panel = Awaited<ReturnType<typeof createPanel>>;

// Saved scores, as PUT /ballots leaves them: Aff won
const score = async (panel: Panel) => {
	await factories.score.create({ ballot: panel.ids[0], tag: 'winloss', value: 1 });
	await factories.score.create({ ballot: panel.ids[1], tag: 'winloss', value: 0 });
};

// The judge confirming their own ballot, logged in with their session
const confirmAsJudge = async (panel: Panel, sessionId: number | null = panel.session.id) => {
	const { req, res } = createPersonContext(
		{ ...panel.person, site_admin: panel.person.site_admin ?? null },
		{
			auth: { method: 'cookie', sessionId, su: null },
			params: { judgeId: String(panel.judge), panelId: String(panel.panel) },
		},
	);
	await confirmBallotScores(req as never, res);
	return res;
};

// Stands in for classic's ballot_confirm.mhtml: unless told not to, audits the ballots like classic does
const classic = (panel: Panel, opts: { confirms?: boolean, timesOut?: boolean } = {}) =>
	vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
		if (opts.confirms ?? true) await updateBallots(db, panel.ids, { audit: 1 });
		if (opts.timesOut) throw new DOMException('The operation timed out.', 'TimeoutError');
		return new Response('<html></html>', { status: 200 });
	});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('confirmBallotScores', () => {
	it('calls classic\'s ballot_confirm with the judge\'s session and returns the confirmed ballot', async () => {
		const panel = await createPanel();
		await score(panel);
		const fetch = classic(panel);

		const res = await confirmAsJudge(panel);

		expect(res.statusCode).toBe(200);
		expect(res.body).toMatchSchema(BallotProgressSchema);
		expect(res.body).toMatchObject({ status: 'confirmed' });

		expect(fetch).toHaveBeenCalledTimes(1);
		const [url, init] = fetch.mock.calls[0] as unknown as [URL, RequestInit];
		expect(url.origin).toBe(new URL(config.classic.url).origin);
		expect(url.pathname).toBe('/user/judge/ballot_confirm.mhtml');
		expect(url.searchParams.get('panel_id')).toBe(String(panel.panel));
		expect(url.searchParams.get('judge_id')).toBe(String(panel.judge));
		expect(init.headers).toMatchObject({ cookie: `${config.cookie.name}=${panel.session.userkey}` });
		expect(init.redirect).toBe('manual');
	});

	it('returns 503 when classic doesn\'t confirm the ballot', async () => {
		const panel = await createPanel();
		await score(panel);
		classic(panel, { confirms: false });

		expect(await confirmAsJudge(panel)).toBeProblemResponse(503);
	});

	it('checks the ballot even when classic is too slow to answer', async () => {
		const panel = await createPanel();
		await score(panel);
		classic(panel, { timesOut: true });

		const res = await confirmAsJudge(panel);

		expect(res.statusCode).toBe(200);
		expect(res.body).toMatchObject({ status: 'confirmed' });
	});

	it('returns 503 when classic is unreachable and the ballot isn\'t confirmed', async () => {
		const panel = await createPanel();
		await score(panel);
		classic(panel, { confirms: false, timesOut: true });

		expect(await confirmAsJudge(panel)).toBeProblemResponse(503);
	});

	it('returns 409 for a ballot with nothing saved, without calling classic', async () => {
		const panel = await createPanel();
		const fetch = classic(panel);

		expect(await confirmAsJudge(panel)).toBeProblemResponse(409);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('treats an already confirmed ballot as confirmed, without calling classic', async () => {
		const panel = await createPanel();
		await score(panel);
		await updateBallots(db, panel.ids, { audit: 1 });
		const fetch = classic(panel);

		const res = await confirmAsJudge(panel);

		expect(res.statusCode).toBe(200);
		expect(res.body).toMatchObject({ status: 'confirmed' });
		expect(fetch).not.toHaveBeenCalled();
	});

	it('returns 501 without a login session, since classic only takes one', async () => {
		const panel = await createPanel();
		await score(panel);
		const fetch = classic(panel);

		// toBeProblemResponse doesn't cover 501
		const res = await confirmAsJudge(panel, null);
		expect(res.statusCode).toBe(501);
		expect(res.body).toMatchObject({ status: 501, detail: 'Confirming a ballot needs a login session' });
		expect(fetch).not.toHaveBeenCalled();
	});
});
