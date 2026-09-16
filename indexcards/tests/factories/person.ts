import personRepo from '../../api/repos/personRepo.js';
import { faker } from '@faker-js/faker';
import factories from './index.js';

import { db } from '../../api/data/database.js';

type Overrides = Partial<Parameters<typeof personRepo.createPerson>[1]> & { Judge?: object, Ballot?: object };

export function createPersonData(overrides: Parameters<typeof personRepo.createPerson>[1] = {}): Parameters<typeof personRepo.createPerson>[1] {
	// Ensure email is always unique by adding a random string
	const uniqueEmail = `user_${Math.random().toString(36).substring(2, 10)}_${Date.now()}@example.com`;
	return {
		email: uniqueEmail,
		first: faker.person.firstName(),
		middle: faker.datatype.boolean() ? faker.person.middleName() : null,
		last: faker.person.lastName(),
		state: faker.location.state({ abbreviated: true }),
		country: faker.location.countryCode(),
		tz: faker.location.timeZone(),
		...overrides,
	};
}

export async function create(overrides: Overrides & { personId?: number } = {}) {
	delete overrides.Judge;
	delete overrides.Ballot;

	const data = createPersonData(overrides);


	return await personRepo.createPerson(db, data);
}
export async function createJudge(overrides: Overrides & { personId?: number } = {}) {
	const {Judge, Ballot: _Ballot, ...personOverrides} = overrides;
	const person = overrides.personId ? { id: overrides.personId } : await personRepo.createPerson(db, createPersonData(personOverrides));
	const judge = await factories.judge.create({ person: person.id, ...Judge });

	return {
		Person: person,
		Judge: judge
	};
}

//create a current ballot for a person
export async function createBallot(overrides: Overrides & { 
		personId?: number,
		Round?: unknown,
		Event?: unknown,
		Timeslot?: unknown,
	} = {}) {
	let Person, Judge;

	const tourn = await factories.tourn.createFull(overrides);
	({ Person, Judge } = await factories.person.createJudge({
		personId: overrides.personId,
		Judge: { category: tourn.Category.id },
	}));

	const panel = await factories.panel.create({
		round: tourn.Round.id,
	});

	const entry1 = await factories.entry.create();
	const entry2 = await factories.entry.create();
	await factories.ballot.create({
		speakerorder: 0,
		judge: Judge.id,
		entry: entry1.id,
		panel: panel.id,
	});
	await factories.ballot.create({
		speakerorder: 1,
		judge: Judge.id,
		entry: entry2.id,
		panel: panel.id,
		...overrides.Ballot,
	});
	return {
		Tourn: tourn.Tourn,
		Person,
		Judge,
	};
}

export default {
	create,
	createPersonData,
	createJudge,
	createBallot,
};
