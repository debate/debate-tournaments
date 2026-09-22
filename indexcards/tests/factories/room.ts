import roomRepo from '../../api/repos/roomRepo.js';
import { fakeSchoolName } from './factoryUtils.js';
import { faker } from '@faker-js/faker';
import { db } from '../../api/data/database.js';

export function createRoomData(overrides = {}) {
	return {
		name: faker.helpers.arrayElement([
			`Room ${faker.number.int({ min: 100, max: 999 })}`,
			`${faker.number.int({ min: 100, max: 999 })}`,
		]),
		building: fakeSchoolName(),
		...overrides,
	};
}

export async function create(overrides = {}) {
	const data = createRoomData(overrides);
	const result = await roomRepo.createRoom(db,data);
	if (!result) throw new Error('Failed to create room');
	return result;
}
export default {
	createRoomData,
	create,
};