import db from '../../api/data/db.js';

async function createSchoolData(overrides = {}) {
	return {
		...overrides,
	};
};
async function create(props = {}) {
	const schoolData = await createSchoolData(props);

	return await db.school.create(schoolData);
}

export default {
	createSchoolData,
	create,
};