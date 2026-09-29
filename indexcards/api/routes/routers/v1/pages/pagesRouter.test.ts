import request from 'supertest';
import server from '../../../../../app.js';
import factories from '../../../../../tests/factories/index.js';
import { UpcomingSchema } from '@tabroom/types';
import z from 'zod';

describe('GET /pages/invite/upcoming', () => {
	it('Returns upcoming tournaments and district weekends', async () => {
		const { Tourn } = await factories.tourn.createFull();

		const res = await request(server)
			.get(`/v1/pages/invite/upcoming`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);
			
		expect(res.body).toMatchSchema(z.array(UpcomingSchema));
		expect(res.body.some((tourn: { tournId: number }) => tourn.tournId === Tourn.id)).toBe(true);
		expect(res.body.some((tourn: { districts: string }) => tourn.districts === 'Yes')).toBe(true);
	});
});

describe('GET /pages/invite/:circuit', () => {
	it('Returns upcoming tournaments for a circuit', async () => {
		const Circuit = await factories.circuit.create();

		const res = await request(server)
			.get(`/v1/pages/invite/${Circuit.id}`)
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200);

		expect(res.body).toMatchSchema(z.array(UpcomingSchema));
	});
});
