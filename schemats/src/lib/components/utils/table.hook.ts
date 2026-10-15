import {
	cellSpanningFeature,
	columnFilteringFeature,
	columnVisibilityFeature,
	createFilteredRowModel,
	createPaginatedRowModel,
	createTableHook,
	createSortedRowModel,
	columnResizingFeature,
	columnSizingFeature,
	filterFn_includesString,
	metaHelper,
	rowPaginationFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_datetime,
	sortFn_text,
	tableFeatures,
} from '@tanstack/svelte-table';
import type { AppColumnMeta } from './table.types';

// Each feature must be registered before its row model and function slots
// (column sizing before resizing, too). Rows are filtered, then sorted, then
// paginated. The sort functions are the ones `sortFn: 'auto'` picks between,
// so they're the names columns can use. Filters match case-insensitively,
// like SVGrid's "contains" search.
const appTableFeatures = tableFeatures({
	columnSizingFeature,
	columnResizingFeature,
	columnVisibilityFeature,
	cellSpanningFeature,
	columnMeta: metaHelper<AppColumnMeta>(),
	columnFilteringFeature,
	filteredRowModel: createFilteredRowModel(),
	filterFns: {
		includesString: filterFn_includesString,
	},
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns: {
		alphanumeric: sortFn_alphanumeric,
		datetime: sortFn_datetime,
		text: sortFn_text,
	},
	rowPaginationFeature,
	paginatedRowModel: createPaginatedRowModel(),
});

export const {
	appFeatures,
	createAppTable,
	createAppColumnHelper,
} = createTableHook({
	features: appTableFeatures,
});
