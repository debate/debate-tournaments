import { error } from '@sveltejs/kit';
import { HIDE_DEV_PAGES } from '$app/env/private';

/**
 * Gates a page that is still in development. Throws a 404 when HIDE_DEV_PAGES is set.
 */
export function requireDevPages() {
	if (HIDE_DEV_PAGES) {
		error(404);
	}
}
