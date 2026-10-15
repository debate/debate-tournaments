import {
	cellSpanningFeature,
	createTableHook,
	createSortedRowModel,
	columnResizingFeature,
	columnSizingFeature,
	metaHelper,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_datetime,
	sortFn_text,
	tableFeatures,
} from '@tanstack/svelte-table';
import type { AppColumnMeta } from './table.types';

// Column sizing must be registered before resizing, and sorting before its
// row model and sort functions. The sort functions are the ones `sortFn: 'auto'`
// picks between, so they're the names columns can use.
const appTableFeatures = tableFeatures({
	columnSizingFeature,
	columnResizingFeature,
	cellSpanningFeature,
	columnMeta: metaHelper<AppColumnMeta>(),
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns: {
		alphanumeric: sortFn_alphanumeric,
		datetime: sortFn_datetime,
		text: sortFn_text,
	},
});

export const {
	appFeatures,
	createAppTable,
	createAppColumnHelper,
} = createTableHook({
	features: appTableFeatures,
});
