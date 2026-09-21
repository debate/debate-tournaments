import request from 'supertest';
import server from '../../../../../app.js';
import factories from '../../../../../tests/factories';
import { faker } from '@faker-js/faker';
import { FileSchema } from '@tabroom/types';

let testTourn;
beforeAll(async () => {
	testTourn = await factories.tourn.create();
	await factories.file.create({ tourn: testTourn.id, published: true });
});

describe('GET /rest/tourns', () => {
	it('Returns the correct shape for the circuit calendar request', async () => {
		//create a circuit and tourn
		const startBefore = faker.date.future();
		const startAfter = faker.date.past();
		const tournDate = faker.date.between({from: startAfter, to: startBefore});
		const Circuit = await factories.circuit.create();
		const Tourn = await factories.tourn.create({ circuit: Circuit.id, start: tournDate });
		await factories.event.create({ tourn: Tourn.id, abbr: 'ABBR' });
		const res = await request(server)
            .get(`/v1/rest/tourns?circuit=${Circuit.id}&startAfter=${startAfter.toISOString()}&startBefore=${startBefore.toISOString()}&limit=10`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

		const body = res.body;
		expect(body).toBeDefined();
		//expect an array
		expect(Array.isArray(body)).toBe(true);
		const tourn = body.find(t => t.id === Tourn.id);
		expect(tourn).toBeDefined();
	});
	it('Returns the correct shape for the results request', async () => {
		//create a circuit and tourn
		const startBefore = faker.date.future();
		const startAfter = faker.date.past();
		const tournDate = faker.date.between({from: startAfter, to: startBefore});
		const Tourn = await factories.tourn.create({ start: tournDate });
		await factories.resultSet.create({ tourn: Tourn.id, published: 1 });
		const res = await request(server)
            .get(`/v1/rest/tourns?startAfter=${startAfter.toISOString()}&startBefore=${startBefore.toISOString()}&limit=10&publishedResults=true`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

		const body = res.body;
		expect(body).toBeDefined();
		//expect an array
		expect(Array.isArray(body)).toBe(true);
		expect(body.length).toBeGreaterThan(0);
	});
});
describe('GET /rest/tourns/:id/files', () => {
	it('should return the files for a specific tourn', async () => {
		const res = await request(server)
            .get(`/v1/rest/tourns/${testTourn.id}/files`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

		const body = res.body;
		body.forEach(element => {
			expect(element).toMatchSchema(FileSchema);
		});
	});
	it('should return 404 if the tourn does not exist', async () => {
		const res = await request(server)
            .get(`/v1/rest/tourns/9999/files`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);

		expect(res).toBeProblemResponse(404);
	});
});

