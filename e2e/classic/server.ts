// Stands in for classic Tabroom in the e2e stack, which has no mason container. Answers only
// the classic pages indexcards calls, the way classic does for the parts the beta depends on.
//
// GET /user/judge/ballot_confirm.mhtml?panel_id=&judge_id=, called by POST .../ballots/confirm:
// - the session comes from the auth cookie (user/login/authenticate.mas), else a redirect to login
// - the judge must belong to that person, unless a site admin (user/judge/autohandler)
// - the judge's ballots with an entry are audited, with entered_by set (ballot_confirm.mhtml 61-88)
// It doesn't run round_done.mas (notifications, backups, autoqueue).
import http from 'node:http';
import config from '../../indexcards/api/config.js';
import { db } from '../../indexcards/api/data/database.js';
import { getBallots, updateBallots } from '../../indexcards/api/repos/ballotRepo.js';
import judgeRepo from '../../indexcards/api/repos/judgeRepo.js';
import { findByUserKey } from '../../indexcards/api/repos/sessionRepo.js';

const PORT = 8080;

// Classic reports errors by redirecting with a message
const redirect = (res: http.ServerResponse, path: string, err: string) => {
	res.writeHead(302, { location: `${path}?err=${encodeURIComponent(err)}` }).end();
};

const cookie = (req: http.IncomingMessage, name: string) =>
	req.headers.cookie?.split(';').map(part => part.trim().split('=')).find(([key]) => key === name)?.[1];

async function ballotConfirm(req: http.IncomingMessage, res: http.ServerResponse, url: URL) {
	const userkey = cookie(req, config.cookie.name);
	const session = userkey ? await findByUserKey(db, userkey) : undefined;
	if (!session) return redirect(res, '/index/index.mhtml', 'You must be logged in to see that page');

	const judgeId = Number(url.searchParams.get('judge_id'));
	const panelId = Number(url.searchParams.get('panel_id'));
	const judge = await judgeRepo.getJudge(db, judgeId);
	if (!judge || (judge.person !== session.person && !session.Person.site_admin)) {
		return redirect(res, '/user/home.mhtml', 'You are not authorized to enter ballots for that judge.');
	}

	const ballots = (await getBallots(db, { judge: judgeId, panel: panelId })).filter(ballot => ballot.entry && ballot.entry > 0);
	if (ballots.length === 0) return redirect(res, '/user/home.mhtml', 'That judge does not judge in that room.');

	await updateBallots(db, ballots.filter(ballot => !ballot.audit).map(ballot => ballot.id), { audit: 1, entered_by: session.person });
	res.writeHead(200, { 'content-type': 'text/html' }).end('<html><body>Ballot confirmed (e2e classic stub)</body></html>');
}

http.createServer(async (req, res) => {
	const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
	try {
		if (req.method === 'GET' && url.pathname === '/user/judge/ballot_confirm.mhtml') {
			return await ballotConfirm(req, res, url);
		}
		if (url.pathname === '/healthz') return res.writeHead(200).end('ok');
		res.writeHead(404).end();
	} catch (err) {
		console.error(err);
		res.writeHead(500).end();
	}
}).listen(PORT, () => console.log(`e2e classic stub on :${PORT}`));
