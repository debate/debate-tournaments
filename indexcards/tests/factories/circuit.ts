import circuitRepo from '../../api/repos/circuitRepo.js';
import { faker } from '@faker-js/faker';
import { db } from '../../api/data/database.js';

export function createCircuitData(overrides = {}) {
	return {
		name: faker.string.alpha({ length: { min: 5, max: 63 } }),
		abbr: faker.string.alpha(4),
		state: faker.location.state({ abbreviated: true }),
		country: faker.location.countryCode(),
		tz: faker.location.timeZone(),
		active: 1,
		...overrides,
	};
}

export async function create(overrides = {}) {
	const data = createCircuitData(overrides);
	return await circuitRepo.createCircuit(db, data);
}
export default {
	createCircuitData,
	create,
};