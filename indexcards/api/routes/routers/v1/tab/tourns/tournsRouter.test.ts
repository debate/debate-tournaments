import request from 'supertest';
import server from '../../../../../../app.js';
import factories from '../../../../../../tests/factories/index.js';
let sessionToken = '';

beforeAll(async () => {
	({ userkey: sessionToken } = await factories.session.create());
});
describe('tournsRouter', () => {
	describe('CRUD lifecycle', () => {
		it('creates, reads, updates, and deletes a tourn', async () => {
			const data = factories.tourn.createTournData();
			const { hidden: _hidden, ...tournRequest } = data;
			var response = await request(server)
				.post('/v1/tab/tourns')
				.set('Authorization', `Bearer ${sessionToken}`)
				.send(tournRequest);
			expect(response.status).toBe(201);
			const tournId = response.body.id;

			response = await request(server)
				.get(`/v1/tab/tourns/${tournId}`)
				.set('Authorization', `Bearer ${sessionToken}`);
			expect(response.status).toBe(200);
			expect(response.body).toMatchObject({
				...data,
				id: tournId,
				start: data.start?.toISOString(),
				end: data.end?.toISOString(),
				hidden: false,
				reg_start: data.reg_start?.toISOString(),
				reg_end: data.reg_end?.toISOString(),
			});

			const updates = { name: 'Updated Tournament Name' };
			response = await request(server)
				.put(`/v1/tab/tourns/${tournId}`)
				.set('Authorization', `Bearer ${sessionToken}`)
				.send(updates);
			expect(response.status).toBe(200);
			expect(response.body.name).toBe(updates.name);

			response = await request(server)
				.delete(`/v1/tab/tourns/${tournId}`)
				.set('Authorization', `Bearer ${sessionToken}`);
			expect(response.status).toBe(204);

			response = await request(server)
				.get(`/v1/tab/tourns/${tournId}`)
				.set('Authorization', `Bearer ${sessionToken}`);
			expect(response).toBeProblemResponse();
		});
	});
});