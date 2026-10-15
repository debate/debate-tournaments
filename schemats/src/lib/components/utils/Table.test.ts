import { fireEvent, render, screen, within } from '@testing-library/svelte';
import { createRawSnippet, type Component } from 'svelte';
import { renderSnippet } from '@tanstack/svelte-table';
import Table from './Table.svelte';
import { createAppColumnHelper } from './table.hook';
import type { TableProps } from './table.types';

type Row = {
	id: number;
	name: string;
	status: string;
};
//needed bc svelte testing library doesn't properly infer generic types when using the component directly
type TableRowComponent = Component<TableProps<Row>>;
const TypedTable = Table as unknown as TableRowComponent;

const columnHelper = createAppColumnHelper<Row>();

const columns = columnHelper.columns([
	columnHelper.accessor((row) => row.name, {
		id: 'name',
		header: 'Name',
		sortFn: 'alphanumeric',
	}),
	columnHelper.accessor((row) => row.status, {
		id: 'status',
		header: 'Status',
	}),
]);

const data: Row[] = [
	{ id: 1, name: 'Bravo', status: 'read' },
	{ id: 2, name: 'Alpha', status: 'unread' },
];

describe('Table.svelte', () => {
	it('renders headers and rows', () => {
		render(TypedTable, { data, columns });

		expect(screen.getByText('Name')).toBeInTheDocument();
		expect(screen.getByText('Status')).toBeInTheDocument();
		expect(screen.getByText('Bravo')).toBeInTheDocument();
		expect(screen.getByText('Alpha')).toBeInTheDocument();
	});

	it('shows the empty message', () => {
		render(TypedTable, {
			data: [],
			columns,
			emptyMessage: 'Nothing here',
		});

		expect(screen.getByText('Nothing here')).toBeInTheDocument();
	});

	it('does not render a tfoot when no footers are defined', () => {
		const { container } = render(TypedTable, { data, columns });

		expect(container.querySelector('tfoot')).not.toBeInTheDocument();
	});

	it('renders a tfoot when a column defines a footer', () => {
		const footerColumns = columnHelper.columns([
			columnHelper.accessor('name', { header: 'Name', footer: 'Total' }),
			columnHelper.accessor('status', { header: 'Status' }),
		]);

		const { container } = render(TypedTable, { data, columns: footerColumns });

		const tfoot = container.querySelector('tfoot');
		expect(tfoot).toBeInTheDocument();
		expect(tfoot).toHaveTextContent('Total');
	});

	it('updates when columns change', async () => {
		const { rerender } = render(TypedTable, { data, columns });

		const renamedColumns = columnHelper.columns([
			columnHelper.accessor('name', { header: 'Entry' }),
		]);
		await rerender({ data, columns: renamedColumns });

		expect(screen.getByText('Entry')).toBeInTheDocument();
		expect(screen.queryByText('Status')).not.toBeInTheDocument();
		expect(screen.queryByText('unread')).not.toBeInTheDocument();
	});

	it('calls onRowClick with the clicked row', async () => {
		const onRowClick = vi.fn();

		render(TypedTable, { data, columns, onRowClick });

		await fireEvent.click(screen.getByText('Bravo'));

		expect(onRowClick).toHaveBeenCalledTimes(1);
		expect(onRowClick).toHaveBeenCalledWith(data[0]);
	});

	it('sorts rows when clicking a sortable header', async () => {
		render(TypedTable, { data, columns });

		const nameHeader = screen.getByRole('button', { name: /name/i });
		await fireEvent.click(nameHeader);

		const bravoCell = screen.getByText('Bravo');
		const alphaCell = screen.getByText('Alpha');

		expect(alphaCell.compareDocumentPosition(bravoCell)).toBe(
			Node.DOCUMENT_POSITION_FOLLOWING,
		);
	});
	describe('column resizing', () => {
		it('does not render the resize handle when enableColumnResizing is false', () => {
			const { container } = render(TypedTable, {
				data,
				columns,
				enableColumnResizing: false,
			});

			expect(container.querySelector('.table-column-resizer')).not.toBeInTheDocument();
		});
		it('renders the resize handle when enableColumnResizing is true', () => {
			const { container } = render(TypedTable, {
				data,
				columns,
				enableColumnResizing: true,
			});

			expect(container.querySelector('.table-column-resizer')).toBeInTheDocument();
		});
		it('does not render the resize handle when a column has enableResizing set to false', () => {
			const customColumns = columnHelper.columns([
				columnHelper.accessor('name', {
					header: 'Name',
					sortFn: 'alphanumeric',
					enableResizing: false,
				}),
				columnHelper.accessor('status', {
					header: 'Status',
					enableResizing: true,
				}),
			]);

			const { container } = render(TypedTable, {
				data,
				columns: customColumns,
				enableColumnResizing: true,
			});

			expect(container.querySelectorAll('.table-column-resizer').length).toBe(1);
		});
	});
	describe('locked column widths', () => {
		const lockedColumns = columnHelper.columns([
			columnHelper.accessor('status', {
				header: 'Status',
				size: 54,
				enableResizing: false,
			}),
			columnHelper.accessor('name', {
				header: 'Name',
				size: 150,
			}),
		]);

		it('locks a non-resizable column at its size and lets the others grow', () => {
			const { container } = render(TypedTable, { data, columns: lockedColumns });

			const [statusHeader, nameHeader] = container.querySelectorAll('th');
			expect(statusHeader.style.width).toBe('1%');
			expect(statusHeader.style.minWidth).toBe('54px');
			expect(statusHeader.querySelector('.table-column-resizer')).not.toBeInTheDocument();
			expect(nameHeader.style.width).toBe('150px');
			expect(nameHeader.style.minWidth).toBe('');
		});

		it('does not lock columns when resizing is disabled for the whole table', () => {
			const { container } = render(TypedTable, {
				data,
				columns,
				enableColumnResizing: false,
			});

			container.querySelectorAll('th').forEach((th) => {
				expect(th.style.width).not.toBe('1%');
			});
		});
	});

	describe('form tables', () => {
		type Speaker = { entry: string; student: string };
		const speakerHelper = createAppColumnHelper<Speaker>();
		const TypedSpeakerTable = Table as unknown as Component<TableProps<Speaker>>;

		const speakers: Speaker[] = [
			{ entry: 'Northview AB', student: 'Ada' },
			{ entry: 'Northview AB', student: 'Ben' },
			{ entry: 'Southview CD', student: 'Cy' },
		];

		const pointsInput = createRawSnippet((student: () => string) => ({
			render: () => `<input type="number" aria-label="Points for ${student()}">`,
		}));

		const speakerColumns = speakerHelper.columns([
			speakerHelper.accessor('entry', { header: 'Entry', spanRows: true }),
			speakerHelper.group({
				id: 'speaker',
				header: 'Speaker',
				columns: speakerHelper.columns([
					speakerHelper.accessor('student', { header: 'Student' }),
					speakerHelper.display({
						id: 'points',
						header: 'Points',
						cell: (info) => renderSnippet(pointsInput, info.row.original.student),
						meta: { truncate: false, cellClass: 'points-cell' },
					}),
				]),
			}),
		]);

		it('merges spanned cells and skips the covered ones', () => {
			const { container } = render(TypedSpeakerTable, { data: speakers, columns: speakerColumns });

			const rows = container.querySelectorAll('tbody tr');
			expect(rows[0].querySelector('td')).toHaveAttribute('rowspan', '2');
			expect(rows[0].querySelectorAll('td')).toHaveLength(3);
			expect(rows[1].querySelectorAll('td')).toHaveLength(2);
			expect(rows[1]).not.toHaveTextContent('Northview AB');
			expect(rows[2].querySelector('td')).not.toHaveAttribute('rowspan');
			expect(container.querySelector('[rowspan="0"]')).not.toBeInTheDocument();
		});

		it('renders grouped headers with colspan and merges shallow headers down', () => {
			const { container } = render(TypedSpeakerTable, { data: speakers, columns: speakerColumns });

			const groupHeader = screen.getByRole('columnheader', { name: /speaker/i });
			expect(groupHeader).toHaveAttribute('colspan', '2');
			expect(groupHeader).toHaveAttribute('scope', 'colgroup');

			const entryHeader = screen.getByRole('columnheader', { name: /entry/i });
			expect(entryHeader).toHaveAttribute('rowspan', '2');
			expect(entryHeader).toHaveAttribute('scope', 'col');

			// Entry's covered leaf header isn't rendered: 2 header cells on top, 2 below
			const headerRows = container.querySelectorAll('thead tr');
			expect(headerRows[0].querySelectorAll('th')).toHaveLength(2);
			expect(headerRows[1].querySelectorAll('th')).toHaveLength(2);
		});

		it('renders no sort buttons when sorting is off', () => {
			const { container } = render(TypedTable, { data, columns, enableSorting: false });

			expect(container.querySelector('.table-sort-button')).not.toBeInTheDocument();
			expect(screen.getByText('Name')).toBeInTheDocument();
		});

		it('keeps an input with its row when data is reordered', async () => {
			const { rerender } = render(TypedSpeakerTable, {
				data: speakers,
				columns: speakerColumns,
				getRowId: (row) => row.student,
			});

			const input = screen.getByLabelText<HTMLInputElement>('Points for Ada');
			await fireEvent.input(input, { target: { value: '28.5' } });

			await rerender({ data: speakers.toReversed(), columns: speakerColumns, getRowId: (row: Speaker) => row.student });

			const adaRow = screen.getByText('Ada').closest('tr')!;
			expect(within(adaRow).getByRole<HTMLInputElement>('spinbutton').value).toBe('28.5');
		});

		it('applies column meta to body cells', () => {
			const { container } = render(TypedSpeakerTable, { data: speakers, columns: speakerColumns });

			const pointsCell = screen.getByLabelText('Points for Ada').closest('td')!;
			expect(pointsCell).toHaveClass('points-cell');
			expect(pointsCell.querySelector('.table-cell-content')).not.toBeInTheDocument();
			expect(container.querySelector('tbody td')!.querySelector('.table-cell-content')).toBeInTheDocument();
		});

		it('renders a screen-reader caption and can turn off striping', () => {
			const { container } = render(TypedTable, { data, columns, caption: 'Speaker points', striped: false });

			expect(screen.getByRole('table', { name: 'Speaker points' })).toBeInTheDocument();
			expect(container.querySelector('caption')).toHaveClass('sr-only');
			expect(container.querySelector('.tabroom-table')).not.toHaveClass('table-striped');
		});
	});

	describe('row clicks', () => {
		it('only marks rows clickable when onRowClick is set', () => {
			const { container, unmount } = render(TypedTable, { data, columns });
			expect(container.querySelector('tbody tr')).not.toHaveClass('table-row-clickable');
			unmount();

			const clickable = render(TypedTable, { data, columns, onRowClick: vi.fn() });
			expect(clickable.container.querySelector('tbody tr')).toHaveClass('table-row-clickable');
		});
	});
});
