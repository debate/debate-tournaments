import type {
	ColumnDef,
	ColumnResizeMode,
	ColumnVisibilityState,
	RowData,
} from '@tanstack/svelte-table';
import type { appFeatures } from './table.hook';
import type { Problem } from '@tabroom/types';

/** Per-column render options read by Table.svelte, set with `meta` on a column def */
export type AppColumnMeta = {
	/** Clip body cell content to one line with an ellipsis. Turn off for inputs so focus rings aren't clipped. Defaults to true. */
	truncate?: boolean;
	/** Classes added to this column's body cells, after the table's cellClass */
	cellClass?: string;
};

export type TableProps<TData extends RowData> = {
	data: TData[] | null | undefined;
	columns: ColumnDef<typeof appFeatures, TData>[];
	/** Only when set are rows clickable and highlighted on hover */
	onRowClick?: (_row: TData) => void;
	getRowClassName?: (_row: TData) => string;
	/** Stable row ids, so rows (and any inputs in them) keep their identity when data is reordered. Defaults to the row index. */
	getRowId?: (_row: TData, _index: number) => string;
	enableSorting?: boolean;
	/** Columns to hide, by column id: `{ id: false }`. Columns not listed are shown. Bindable. */
	columnVisibility?: ColumnVisibilityState;
	enableColumnResizing?: boolean;
	columnResizeMode?: ColumnResizeMode;
	/** Stripe alternate body rows. Turn off when rows are grouped by spanned cells. */
	striped?: boolean;
	/** Screen-reader caption naming the table */
	caption?: string;
	containerClass?: string;
	tableClass?: string;
	headerClass?: string;
	cellClass?: string;
	footerClass?: string;
	/** the message to display when the table has no data */
	emptyMessage?: string;
	isLoading?: boolean;
	isError?: boolean;
	problem?: Problem | null;
};

