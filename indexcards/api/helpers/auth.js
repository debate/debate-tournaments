import { sql } from 'kysely';
import db from '../data/db.js';
import { db as kdb } from '../data/database.js';
import logger from './logger.js';
/**
 * Dead code
 */
export const tabAuth = async (req) => {

	if (!req.person || !req.person.id) {
		return req.session;
	}

	if (!req.session.perms || !req.session.perms?.tourn) {
		req.session.perms = {
			tourn    : {},
			event    : {},
			category : {},
		};
	}

	// User request must have access to the tournament.  Figure out how!
	const tournId = req.params.tournId;
	const typeId  = req.params.typeId;
	let subType   = req.params.subType;

	let tourn = {};

	try {
		tourn = await db.summon(db.tourn, tournId);
	} catch (err) {
		return (err);
	}

	let perms = {};

	if (req.person.site_admin) {

		req.session.perms.tourn[tournId] = 'owner';
		req.session.tourn = tourn;
		perms = req.session.perms;

	} else {

		perms = await tournPerms(tournId, req.session.person);

		if (!perms || !perms.tourn[tournId]) {
			return req.session;
		}

		req.session.tourn = tourn;
		req.session.perms.tourn[tournId] = perms.tourn[tournId];
	}

	Object.keys(perms.event).forEach( eventId => {
		req.session.perms.event[eventId] = perms.event[eventId];
	});

	Object.keys(perms.category).forEach( categoryId => {
		req.session.perms.category[categoryId] = perms.category[categoryId];
	});

	// Top level tournament access.  Things for checkers etc will go under
	// /all, where fine grained permissions are managed locally.

	const permittedSubTypes = [
		'section',
		'panel',
		'round',
		'event',
		'category',
		'timeslot',
		'judge',
		'jpool',
		'all',
	];

	if (!subType || !permittedSubTypes.includes(subType)) {

		if (perms.tourn[tournId] === 'owner'
			|| perms.tourn[tournId] === 'tabber'
		) {
			return req.session;
		}
		delete req.session.tourn;
		delete req.session.perms;
		return req.session;
	}

	if (subType === 'all') {
		return req.session;
	}

	// If it's a section, then I check up the chain for a round, event and
	// tourn that matches the parent.

	if (subType === 'section') {
		if (subType === 'section') {
			subType = 'panel';
		}
		const { rows: outputs } = await sql`
			select
				${sql.table(subType)}.*,
				event.category category,
				event.tourn tourn
			from ${sql.table(subType)}, round, event
			where ${sql.ref(`${subType}.id`)} = ${typeId}
				and ${sql.ref(`${subType}.round`)} = round.id
				and round.event = event.id
				and event.tourn = ${tournId}
		`.execute(kdb);

		if (!outputs || !outputs.length > 0) {
			delete req.session.tourn;
			delete req.session.perms;
			return req.session;
		}

		const output = outputs.shift();

		if (
			perms.tourn[tournId] === 'owner'
			|| perms.tourn[tournId] === 'tabber'
			|| req.session.perms.events?.[output.event].tag === 'tabber'
			|| req.session.perms.categories?.[output.category].tag === 'tabber'
		) {
			req.session[subType] = output;
			return req.session;
		}
		delete req.session.tourn;
		delete req.session.perms;
		return req.session;
	}

	// If we're in a timeslot and you have non tournament level permissions, filter only
	// those timeslots which have rounds for the events that you are allowed access.

	if (subType === 'timeslot') {

		let queryLimiter = sql``;

		const replacements = {
			eventIds   : [],
			timeslotId : req.params.typeId,
			tournId    : req.params.tournId,
		};

		if (perms.tourn[tournId] !== 'owner' && perms.tourn[tournId] !== 'tabber') {

			if (req.session.perms?.event) {
				for (const eventId of Object.keys(req.session.perms.event)) {
					if (req.session.perms.event[eventId] === 'tabber') {
						replacements.eventIds.push(eventId);
					}
				}

				if (replacements.eventIds.length === 0) {
					return 'You do not have access to that timeslot through your event level permissions';
				}

				queryLimiter = sql`
					and exists (
						select round.id
							from round
						where round.timeslot = timeslot.id
							and round.event IN (${sql.join(replacements.eventIds)})
					)
				`;
			}
		}

		const { rows: outputs } = await sql`
			select
				${sql.table(subType)}.*,
				GROUP_CONCAT(event.id) as events
			from ${sql.table(subType)}, round, event
			where ${sql.ref(`${subType}.id`)} = ${replacements.timeslotId}
				and ${sql.ref(`${subType}.id`)} = ${sql.ref(`round.${subType}`)}
				and round.event = event.id
				and event.tourn = ${replacements.tournId}
				${queryLimiter}
			group by ${sql.ref(`${subType}.id`)}
		`.execute(kdb);

		if (!outputs || !outputs.length > 0) {
			delete req.session.tourn;
			delete req.session.perms;
			return req.session;
		}

		const output = outputs.shift();
		req.session[subType] = output;
		if (output.events) {
			req.session.event = output.events.split(',');
		}

		return req.session;
	}

	// If the data table's parent is an Event, it can go here and be reachable by an
	// event level permission.

	if (subType === 'round' || subType === 'entry') {
		const { rows: outputs } = await sql`
			select
				${sql.table(subType)}.*,
				event.category category,
				event.tourn tourn
			from ${sql.table(subType)}, event
			where ${sql.ref(`${subType}.id`)} = ${typeId}
				and ${sql.ref(`${subType}.event`)} = event.id
				and event.tourn = ${tournId}
		`.execute(kdb);

		if (!outputs || !outputs.length > 0) {
			delete req.session.tourn;
			delete req.session.perms;
			return req.session;
		}

		const output = outputs.shift();

		if (
			perms.tourn[tournId] === 'owner'
			|| perms.tourn[tournId] === 'tabber'
			|| perms.tourn[tournId] === 'checker'
			|| req.session.perms.event?.[output.event]
			|| req.session.perms.category?.[output.category]
		) {
			req.session[subType] = output;
			return req.session;
		}

		delete req.session.tourn;
		delete req.session.perms;
		return req.session;
	}

	// If the data table's parent is a Category, it can go here and be reachable by an
	// category level permission.

	if (subType === 'event' || subType === 'judge' || subType === 'jpool') {

		const { rows: outputs } = await sql`
			select
				${sql.table(subType)}.*,
				category.tourn tournId
			from ${sql.table(subType)}, category
			where ${sql.ref(`${subType}.id`)} = ${typeId}
				and ${sql.ref(`${subType}.category`)} = category.id
				and category.tourn = ${tournId}
		`.execute(kdb);

		if (!outputs || !outputs.length > 0) {
			delete req.session.tourn;
			delete req.session.perms;
			return req.session;
		}

		const output = outputs.shift();

		if (
			perms.tourn[tournId] === 'owner'
			|| perms.tourn[tournId] === 'tabber'
			|| (subType === 'event' && req.session.perms.event?.[typeId] === 'tabber')
			|| req.session.perms.category?.[output.category] === 'tabber'
		) {
			req.session[subType] = output;
			return req.session;
		}

		delete req.session.tourn;
		delete req.session.perms;
		return req.session;
	}

	if (subType === 'category') {
		const category = await db.summon(db.category, typeId);
		if (category.tourn !== req.session.tourn.id) {
			delete req.session.tourn;
			delete req.session.perms;
			return req.session;
		}

		if (
			perms.tourn[tournId] === 'owner'
			|| perms.tourn[tournId] === 'tabber'
			|| req.session.perms.categories?.[typeId].tag === 'tabber'
		) {
			req.session.category = category;
			return req.session;
		}
		delete req.session.tourn;
		delete req.session.perms;
		return req.session;
	}

	if ( perms.tourn[tournId] === 'owner' || perms.tourn[tournId] === 'tabber') {
		return req.session;
	}
};

export const tournPerms = async (tournId, personId) => {

	const { rows: permissions } = await sql`
		select permission.id, permission.event, permission.category, permission.tag
			from permission
		where person = ${personId}
			and tourn = ${tournId}
			order by tag
	`.execute(kdb);

	if (permissions.length < 1) {
		return;
	}

	const perms = {
		tourn    : {},
		event    : {},
		category : {},
		contact  : {},
	};

	for await (const newPerm of permissions) {

		if (newPerm.tag === 'contact') {
			perms.contact[tournId] = true;
		} else if (newPerm.event) {
			perms.event[newPerm.event] = newPerm.tag;
		} else if (newPerm.category) {
			perms.category[newPerm.category] = newPerm.tag;
		} else if (
			(newPerm.tag === 'owner')
			|| (newPerm.tag === 'tabber'
					&& perms.tourn[tournId] !== 'owner')
			|| (newPerm.tag === 'checker'
					&& perms.tourn[tournId] !== 'owner'
					&& perms.tourn[tournId] !== 'tabber')
		) {
			perms.tourn[tournId] = newPerm.tag;
		}
	}

	if (!perms.tourn[tournId] && permissions.length > 0) {
		perms.tourn[tournId] = 'limited';
	}

	return perms;
};

export const localAuth = async (req) => {

	// This one's a bit more of a pain because it handles several
	// different types of request

	const localType = req.params.localType;
	const localId = req.params.localId;

	if (
		localType === 'circuit'
		|| localType === 'chapter'
		|| localType === 'diocese'
		|| localType === 'district'
	) {

		const { rows: permissions } = await sql`
			select perm.id, perm.tag
				from permission perm
			where perm.person = ${req.session.person}
				and ${sql.ref(`perm.${localType}`)} = ${localId}
		`.execute(kdb);

		if (permissions && permissions[0]?.tag) {
			const local = await db.summon(db[localType], localId);
			return { local, perms: permissions[0].tag };
		}
	}

	return `You have no access permissions to that ${localType}`;
};

export const hostAuth = async (req) => {

	// Request must originate from the local cron authorized hosts.
	// otherwise, in theory someone could try to DDOS us or something here
	if (req.config.CRON_HOSTS.includes(req.ip)) {
		return true;
	}
	return `Host ${req.ip} is not allowed to access automatic functions`;
};

export const checkJudgePerson = async (req, judgeId) => {

	if (!req.session) {
		return false;
	}

	if (req.session.site_admin) {
		return true;
	}

	const judge = await db.summon(db.judge, judgeId);

	if (judge.person === req.session.person) {
		return true;
	}

	return false;
};

export const checkPerms = async (req, res, query) => {

	if (!req.session) {
		return 'You must be logged in to access that function';
	}

	if (req.session?.site_admin) {
		return true;
	}

	const { rows: [permsData] } = await query.execute(kdb);

	if (!permsData) {
		return 'Data about that tournament element was not found';
	}

	const { rows: permissions } = await sql`
		select permission.*
			from permission
		where permission.person = ${req.session.person}
			and permission.tourn = ${permsData.tourn}
	`.execute(kdb);

	if (!permissions) {
		return 'You have no access permissions to tab that tournament';
	}

	const perms = {};

	for await (const perm of permissions) {
		if (perms.details) {
			perms[perm.tag] = JSON.parse(perms.details);
		} else {
			perms[perm.tag] = true;
		}
	}

	if (perms.owner) {
		return true;
	}

	if (permsData.ownerAccess) {
		return 'Only tournament owners may access that function';
	}

	if (perms.tabber) {
		return true;
	}

	if (permsData.site && permsData.timeslot) {
		const { rows: okEvents } = await sql`
			select
				distinct round(event) id
			from round
				where round.timeslot = ${permsData.timeslot}
				and round.site = ${permsData.site}
		`.execute(kdb);

		for await (const event of okEvents) {
			if (!permsData.event) {
				permsData.event = {};
			}
			permsData.event[event.id] = 'checker';
		}
	}

	if (req.session[permsData.tourn]) {
		if (req.session[permsData.tourn].level === 'owner') {
			return true;
		}

		if (
			req.session[permsData.tourn].level === 'tabber'
			&& req.threshold !== 'owner'
		) {
			return true;
		}

		if (
			req.session[permsData.tourn].level === 'checker'
			&& req.threshold !== 'tabber'
			&& req.threshold !== 'owner'
		) {
			return true;
		}

		if (req.session[permsData.tourn].level === 'by_event') {

			if (
				(req.threshold === 'tabber' || req.threshold === 'admin')
				&& req.session[permsData.tourn].event[permsData.event] === 'tabber'
			) {
				return true;
			}

			if (
				req.session[permsData.tourn].events
			) {

				if ( permsData.event
					&& req.session[permsData.tourn].events[permsData.event] === 'checker'
					&& req.threshold !== 'owner'
					&& req.threshold !== 'tabber'
				) {
					return true;
				}

				if ( permsData.event
					&& req.session[permsData.tourn].events[permsData.event] === 'tabber'
					&& req.threshold !== 'owner'
				) {
					return true;
				}

				if (permsData.events) {

					let OK = false;

					permsData.events.forEach( eventId => {

						if (req.session[permsData.tourn].events[eventId] === 'tabber'
							&& req.threshold !== 'owner'
						) {

							OK = true;
							return true;
						}

						if (req.session[permsData.tourn].events[eventId.toString()] === 'checker'
							&& req.threshold !== 'owner'
							&& req.threshold !== 'tabber'
						) {
							OK = true;
							return true;
						}
					});

					if (OK) {
						return true;
					}
				}
			}
		}
	}

	logger.error({
		error     : true,
		message   : `You do not have permission to access that part of that tournament`,
	});

	return false;
};

export const sectionCheck = async (req, res, sectionId) => {

	const sectionQuery = sql`
		select event.tourn, event.id event
			from panel, round, event
		where panel.id = ${sectionId}
			and panel.round = round.id
			and round.event = event.id
	`;

	return checkPerms(req, res, sectionQuery);
};

export const roundCheck = async (req, res, roundId) => {

	const roundQuery = sql`
		select event.tourn, event.id event
			from round, event
		where round.id = ${roundId}
			and round.event = event.id
	`;

	return checkPerms(req, res, roundQuery);
};

export const eventCheck = async (req, res, eventId) => {
	const eventQuery = sql`
		select event.tourn, event.id event
			from event
		where event.id = ${eventId}
	`;

	return checkPerms(req, res, eventQuery);
};

export const entryCheck = async (req, res, entryId) => {
	const entryQuery = sql`
		select event.tourn, entry.event
		from entry, event
		where entry.id = ${entryId}
			and entry.event = event.id
	`;

	return checkPerms(req, res, entryQuery);
};

export const schoolCheck = async (req, res, schoolId) => {
	const schoolQuery = sql`
		select school.tourn, school.id school
			from school
		where school.id = ${schoolId}
	`;

	return checkPerms(req, res, schoolQuery);
};

export const timeslotCheck = async (req, res, timeslotId) => {
	const timeslotQuery = sql`
		select timeslot.tourn, timeslot.id timeslot
			from timeslot
		where timeslot.id = ${timeslotId}
	`;

	return checkPerms(req, res, timeslotQuery);
};

export const jpoolCheck = async (req, res, jpoolId) => {
	const jpoolQuery = sql`
		select category.tourn, jpool.id jpool, round.event event,
			st.value timeslot, jpool.site
			from (jpool, category)
				left join jpool_round jpr on jpr.jpool = jpool.id
				left join round on round.id = jpr.round
				left join jpool_setting st on st.tag = 'standby_timeslot' and st.jpool = jpool.id
		where jpool.id = ${jpoolId}
			and jpool.category = category.id
			group by jpool.id
	`;
	return checkPerms(req, res, jpoolQuery);
};

export const judgeCheck = async (req, res, judgeId) => {
	const judgeQuery = sql`
		select category.tourn, event.id event
			from category, event, judge
		where judge.id = ${judgeId}
			and judge.category = category.id
			and category.id = event.category
	`;

	return checkPerms(req, res, judgeQuery);
};

export const categoryCheck = async (req, res, categoryId) => {
	const categoryQuery = sql`
		select category.tourn, event.id event
			from category, event
		where category.id = ${categoryId}
			and category.id = event.category
	`;

	return checkPerms(req, res, categoryQuery);
};
