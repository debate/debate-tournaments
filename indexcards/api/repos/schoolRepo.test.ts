
import schoolRepo from './schoolRepo.js';
import { db } from '../data/database.js';

describe('getSchool', () => {
	it('Returns null when school does not exist', async () => {
		const result = await schoolRepo.getSchool(db, 99999);
		expect(result).toBeUndefined();
	});
});
describe('createSchool', () => {
	it('Creates a new school when given valid data', async () => {
		// Arrange
		const schoolData = {
			name: 'Test School',
			code: 'TS123',
			onsite: 1,
			settings: {
				contact: 500,
			},
		};

		// Act
		const createdId = await schoolRepo.createSchool(db, schoolData);

		// Assert
		expect(createdId).toBeDefined();

		const fetchedSchool = await schoolRepo.getSchool(db, createdId, { settings: true });
		expect(fetchedSchool).toBeDefined();
		expect(fetchedSchool?.name).toBe(schoolData.name);
		expect(fetchedSchool?.code).toBe(schoolData.code);
		expect(fetchedSchool?.onsite).toBe(true);
		expect(fetchedSchool?.settings?.contact).toEqual('500');

	});
	it('Creates a new school without settings when settings are not provided', async () => {
		// Arrange
		const schoolData = {
			name: 'No Settings School',
			code: 'NSS123',
			onsite: 1,
		};

		// Act
		const createdId = await schoolRepo.createSchool(db, schoolData);

		// Assert
		expect(createdId).toBeDefined();

		const fetchedSchool = await schoolRepo.getSchool(db, createdId, { settings: true });
		expect(fetchedSchool).toBeDefined();
		expect(fetchedSchool?.name).toBe(schoolData.name);
		expect(fetchedSchool?.code).toBe(schoolData.code);
		expect(fetchedSchool?.onsite).toBe(true);
		expect(fetchedSchool?.settings).toEqual(null);
	});
});
describe('updateSchool', () => {
	let createdId: number | undefined;

	beforeEach(async () => {
		// Create a school to update
		const schoolData = {
			name: 'Update Test School',
			code: 'UTS123',
			onsite: 1,
			settings: {
				contact: 600,
			},
		};
		createdId = await schoolRepo.createSchool(db, schoolData);
	});

	it('Updates existing school fields', async () => {
		// Arrange
		const updateData = {
			name: 'Updated School Name',
			code: 'USN456',
			onsite: 0,
		};

		// Act
		await schoolRepo.updateSchool(db, createdId as number, updateData);

		// Assert
		const updatedSchool = await schoolRepo.getSchool(db, createdId as number, { settings: true });
		expect(updatedSchool?.name).toBe(updateData.name);
		expect(updatedSchool?.code).toBe(updateData.code);
		expect(updatedSchool?.onsite).toBe(false);
		expect(updatedSchool?.settings).toEqual({ contact: '600' }); // settings should remain unchanged
	});
});
describe('deleteSchool', () => {
	let createdId: number | undefined;

	beforeEach(async () => {
		// Create a school to delete
		const schoolData = {
			name: 'Delete Test School',
			code: 'DTS123',
			onsite: 1,
			settings: {
				contact: 700,
			},
		};
		createdId = await schoolRepo.createSchool(db, schoolData);
	});

	it('Deletes an existing school', async () => {
		await schoolRepo.deleteSchool(db, createdId as number);
		const fetchedSchool = await schoolRepo.getSchool(db, createdId as number);
		expect(fetchedSchool).toBeUndefined();
	});
});