import db from '../data/db.js';
import { quizInclude } from './quizRepo.js';

type queryOpts = {
	limit?: number;
	offset?: number;
}
function buildPersonQuizQuery(opts = {}) {

	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};

	if (opts.where) {
		query.where = { ...query.where, ...opts.where };
	}


	if (opts.limit) {
		query.limit = Number(opts.limit);
	}

	if (opts.offset) {
		query.offset = Number(opts.offset);
	}

	return query;
}

export function personQuizInclude(opts = {}) {
	return {
		model: db.personQuiz,
		as: 'person_quizzes',
		...buildPersonQuizQuery(opts),
	};
}

async function createPersonQuiz(data) {
	const newPersonQuiz = await db.personQuiz.create(data);
	return newPersonQuiz.id;
}

export default {
	createPersonQuiz,
};