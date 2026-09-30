import type { ZodType } from 'zod';


interface CustomMatchers<R = unknown> {
	toEqualDate(expected: Date | string | number): R;
	toBeProblemResponse(code?: 400 | 401 | 403 | 404 | 429 | 500): R;
	toMatchSchema(schema: ZodType): R;
}

declare module 'vitest' {
	interface Assertion<T = unknown> {
		toEqualDate(expected: Date | string | number): T;
		toBeProblemResponse(code?: 400 | 401 | 403 | 404 | 429 | 500): T;
		toMatchSchema(schema: ZodType): T;
	}

	interface AsymmetricMatchersContaining {
		toEqualDate(expected: Date | string | number): unknown;
		toBeProblemResponse(code?: 400 | 401 | 403 | 404 | 429 | 500): unknown;
		toMatchSchema(schema: ZodType): unknown;
	}
}
