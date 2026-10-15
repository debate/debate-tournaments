import factories from '../../tests/factories/index.js';
import { createContext, createPersonContext } from '../../tests/httpMocks.js';
import { createActor } from '../middleware/auth/authorization.js';
import { requireJudgeOnPanel } from './judgePolicy.js';

describe('requireJudgeOnPanel', () => {
	it('passes when the judge has a ballot on the panel', async () => {
		const judge = await factories.judge.create();
		const round = await factories.round.create({ published: 1 });
		const panel = await factories.panel.create({ round: round.id });
		const ballot = await factories.ballot.create({ judge: judge.id, panel: panel.id });
		const { req, res, next } = createPersonContext(await factories.person.create(), {
			params: { judgeId: String(judge.id), panelId: String(ballot.panel) },
		});

		await requireJudgeOnPanel(req, res, next);

		expect(next).toHaveBeenCalledWith();
		expect(res.status).not.toHaveBeenCalled();
	});

	it('returns 404 when the judge has no ballot on the panel', async () => {
		const judge = await factories.judge.create();
		const otherJudge = await factories.judge.create();
		const ballot = await factories.ballot.create({ judge: otherJudge.id });
		const { req, res, next } = createPersonContext(await factories.person.create(), {
			params: { judgeId: String(judge.id), panelId: String(ballot.panel) },
		});

		await requireJudgeOnPanel(req, res, next);

		expect(res.statusCode).toBe(404);
		expect(next).not.toHaveBeenCalled();
	});

	describe('before the round is out to judges', () => {
		// The judge's ballot on a round with the given published value and settings, with the
		// actor holding what the auth context loaders grant: self on the judge, plus the given role
		const judgeBallot = async (round: { published: number, settings?: Record<string, string> }, role?: 'tabber') => {
			const person = await factories.person.create();
			const tourn = await factories.tourn.create();
			const category = await factories.category.create({ tourn: tourn.id });
			const event = await factories.event.create({ tourn: tourn.id, category: category.id });
			const created = await factories.round.create({ event: event.id, ...round });
			const panel = await factories.panel.create({ round: created.id });
			const judge = await factories.judge.create({ person: person.id, category: category.id });
			await factories.ballot.create({ judge: judge.id, panel: panel.id });

			const context = createPersonContext(person, { params: { judgeId: String(judge.id), panelId: String(panel.id) } });
			context.req.actor.grant([
				{ scope: 'judge', id: judge.id, role: 'self', categoryId: category.id, tournId: tourn.id },
				...(role ? [{ scope: 'tourn', id: tourn.id, role }] : []),
			]);
			return context;
		};

		it('returns 404 to the judge while the round is unpublished, as if there were no ballot', async () => {
			const { req, res, next } = await judgeBallot({ published: 0 });

			await requireJudgeOnPanel(req, res, next);

			expect(res.statusCode).toBe(404);
			expect(res.body).toMatchObject({ detail: expect.stringMatching(/has no ballot on panel/) });
			expect(next).not.toHaveBeenCalled();
		});

		it('lets the judge through once the round is published', async () => {
			const { req, res, next } = await judgeBallot({ published: 1 });

			await requireJudgeOnPanel(req, res, next);

			expect(next).toHaveBeenCalledWith();
		});

		it('lets the judge through an unpublished round with judges_ballots_visible', async () => {
			const { req, res, next } = await judgeBallot({ published: 0, settings: { judges_ballots_visible: '1' } });

			await requireJudgeOnPanel(req, res, next);

			expect(next).toHaveBeenCalledWith();
		});

		it('hides rounds published only for brackets or listings', async () => {
			const { req, res, next } = await judgeBallot({ published: 3 });

			await requireJudgeOnPanel(req, res, next);

			expect(res.statusCode).toBe(404);
		});

		it('lets tab staff through before the round is published', async () => {
			const { req, res, next } = await judgeBallot({ published: 0 }, 'tabber');

			await requireJudgeOnPanel(req, res, next);

			expect(next).toHaveBeenCalledWith();
		});
	});

	it('passes anonymous callers through without checking', async () => {
		const { req, res, next } = createContext({
			params: { judgeId: '999999999', panelId: '999999999' },
		});
		req.actor = createActor(req.db, null);

		await requireJudgeOnPanel(req, res, next);

		expect(next).toHaveBeenCalledWith();
		expect(res.status).not.toHaveBeenCalled();
	});
});
