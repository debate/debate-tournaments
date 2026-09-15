import type { ZodOpenApiOperationObject, ZodOpenApiPathItemObject } from 'zod-openapi';
import type { Tourn } from '../data/schema.js';
import type { Selectable } from 'kysely';

export type RouteOpenApiConfig = (ZodOpenApiPathItemObject | ZodOpenApiOperationObject) & {
	path: string;
};

declare module 'express-serve-static-core' {
	interface IRoute<Route extends string = string> {
		openapi?: RouteOpenApiConfig;
	}
	interface Request {
		actor: {
			su: number | null;
			Person?: {
				id: number;
			};
			Su?: {
				id: number;
				email: string;
			};
		}; // Replace `any` with the actual type of `actor` if available
		valid: {
			// oxlint-disable-next-line typescript/no-explicit-any
			body:any;
			// oxlint-disable-next-line typescript/no-explicit-any
			params:any;
			// oxlint-disable-next-line typescript/no-explicit-any
			query:any;
		};
		tourn?: Selectable<Tourn>;
	}
}

