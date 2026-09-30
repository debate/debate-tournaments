import type { DB } from './schema.js'
import { createPool } from 'mariadb'
import { Kysely, SafeNullComparisonPlugin } from 'kysely'
import { MariadbDialect } from "kysely-mariadb";
import config from '../config.js'
import logger, { logDB } from '../helpers/logger.js'

const dialect = new MariadbDialect({
  mariadb: createPool({
    database: config.db.database,
    host: config.db.host,
    user: config.db.user,
    password: config.db.pass,
    port: config.db.port,
	timezone: 'Z',
	...config.db.pool,
	bigIntAsNumber: true,
	// TINYINT(1) columns come back as numbers. Several of them hold values
	// other than 0/1 (ballot.side, entry.unconfirmed, panel.publish), so
	// casting them to booleans loses data.
  })
})

export const db = new Kysely<DB>({
	dialect,
	plugins: [
		new SafeNullComparisonPlugin(),
	],
	log(event){
		if (event.level === 'error'){
			logger.error('DB Error Event:', event);
		}
		logDB(event.query.sql, event.queryDurationMillis);
	},
})

export type Database = Kysely<DB>;
export type DBSchema = DB;
