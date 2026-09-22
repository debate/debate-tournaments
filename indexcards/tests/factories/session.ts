import sessionRepo from '../../api/repos/sessionRepo.js';
import type { Insertable } from 'kysely';
import type { Session, Person } from '../../api/data/schema.js';
import factories from './index.js';
import { faker } from '@faker-js/faker';
import { db } from '../../api/data/database.js';

type Overrides = Partial<Insertable<Session>> & { Person?: Partial<Insertable<Person>> };

export function createData(overrides: Overrides = {}): Insertable<Session> {
	delete overrides.Person;
	return {
		ip: faker.internet.ip(),
		...overrides,
	};
}

export async function create(overrides: Overrides = {}) {
	if(!overrides.person || overrides.Person) {
		const Person = await factories.person.create(overrides.Person);
		overrides.person = Person.id;
	}

	const data = createData(overrides);
	return await sessionRepo.createSession(db,data);
}

export default {
	create,
	createData,
};