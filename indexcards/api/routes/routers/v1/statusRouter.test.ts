import request from 'supertest';
import app from '../../../../app.js';
import { SystemStatusSchema } from '@tabroom/types';
import factories from '../../../../tests/factories/index.js';
import config from '../../../config.js';

describe('GET /v1/status', () => {
	it('should return the system status', async () => {
		const response = await request(app).get('/v1/status');
		expect(response.status).toBe(200);
		expect(response.body).toMatchSchema(SystemStatusSchema);
	});
});
describe('GET /v1/status/barf', () => {
	let adminSession!: string;
	let nonAdminSession!: string;
	beforeAll(async () => {
		const Admin = await factories.person.create({ site_admin: 1 });
		({ userkey: adminSession } = await factories.session.create({person: Admin.id }));
		const NonAdmin = await factories.person.create({ site_admin: 0 });
		({ userkey: nonAdminSession } = await factories.session.create({person: NonAdmin.id }));
	});
	it('should trigger a barf and return a 500 status', async () => {
		const response = await request(app).get('/v1/status/barf').set('Cookie', [`${config.cookie.name}=${adminSession}`]);
		expect(response.status).toBe(500);
	});
	it('returns 403 for non-admin access', async () => {
		const response = await request(app).get('/v1/status/barf').set('Cookie', [`${config.cookie.name}=${nonAdminSession}`]);
		expect(response.status).toBe(403);
	});
});