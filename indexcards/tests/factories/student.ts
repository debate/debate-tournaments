import { faker } from '@faker-js/faker';
import studentRepo from '../../api/repos/studentRepo.js';
import { db } from '../../api/data/database.js';

export function buildStudentData(overrides = {}) {
	return {
		first: faker.person.firstName(),
		middle: faker.datatype.boolean() ? faker.person.middleName() : null,
		last: faker.person.lastName(),
		grad_year: new Date().getFullYear() + 3,
		...overrides,
	};
}

export async function create(overrides = {}) {
	const data = buildStudentData(overrides);

	return await studentRepo.createStudent(db, data);
}

export default {
	buildStudentData,
	create,
};
