import { Authenticate } from '../middleware/authentication.js';
import config from '../config.js';
import { tabAuth } from './auth';
import userData from '../../tests/testFixtures';
import { createContext } from '../../tests/httpMocks.js';

describe.todo('Authorization Functions', () => {

	it('Permits an ordinary user access to a tournament it is admin for', async () => {

		const testTourn = userData.testUserTournPerm.tourn;

		const { req, res } = createContext({
			person: {
				id: userData.testUserSession.person,
			},
			config,
			params: {
				tournId : testTourn,
			},
			cookies : {
				[config.cookie.name]: userData.testUserSession.userkey,
			},
		});
		// Call the middleware to set req.session
		await new Promise((resolve, reject) => {
			Authenticate(req, res, (err) => {
				if (err) reject(err);
				else resolve();
			});
		});

		req.session = await tabAuth(req);

		expect(req.session).toBeTypeOf('object');
		expect(req.session.perms).toBeTypeOf('object');
		expect(req.session.tourn).toBeTypeOf('object');
		expect(req.session.perms.tourn[testTourn]).toBe('tabber');

	});

	it('Denies user access to a tournament it is not admin for', async () => {

		const testNotTourn = '9700';

		const req = {
			config,
			params: {
				tournId : testNotTourn,
			},
			cookies : {
				[config.cookie.name]: userData.testUserSession.userkey,
			},
			clearCookie: vi.fn(),
		};

		const res = {};
		// Call the middleware to set req.session
		await new Promise((resolve, reject) => {
			Authenticate(req, res, (err) => {
				if (err) reject(err);
				else resolve();
			});
		});
		req.session = await tabAuth(req);

		expect(req.session).toBeTypeOf('object');
		expect(req.session?.perms?.tourn).toEqual({});
	});

	it('Finds a session for an GLP Admin user', async () => {
		const { req, res } = createContext({
			person: {
				id: userData.testAdminSession.person,
			},
			config,
			cookies : {
				[config.cookie.name]: userData.testAdminSession.userkey,
			},
		});

		// Call the middleware to set req.session
		await new Promise((resolve, reject) => {
			Authenticate(req, res, (err) => {
				if (err) reject(err);
				else resolve();
			});
		});

		const session = req.session;

		expect(session).toBeTypeOf('object');
		expect(session.person).toBe(70);
		expect(req.person.site_admin).toBe(1);
		expect(req.person.email).toBe('i.am.god@speechanddebate.org');
	});

	it('Permits GLP admin access to a tournament it is not admin for', async () => {

		const testNotTourn = '9700';

		const { req, res } = createContext({
			config,
			params: {
				tournId : testNotTourn,
			},
			cookies : {
				[config.cookie.name]: userData.testAdminSession.userkey,
			},
			clearCookie: vi.fn(),
		});

		// Call the middleware to set req.session
		await new Promise((resolve, reject) => {
			Authenticate(req, res, (err) => {
				if (err) reject(err);
				else resolve();
			});
		});
		req.session = await tabAuth(req);

		expect(req.session).toBeTypeOf('object');
		expect(req.session.perms.tourn[testNotTourn]).toBe('owner');
	});

});
