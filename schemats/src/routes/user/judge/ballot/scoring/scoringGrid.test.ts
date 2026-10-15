import { createRawSnippet } from 'svelte';
import { debateContext } from '../../../../../storybook/stories/routes/user/judge/ballots/fixtures';
import { scoringColumns, scoringRowId, scoringRows, sidesHeading, type ScoringCells } from './scoringGrid';

const empty = createRawSnippet(() => ({ render: () => '<span></span>' }));
const cells: ScoringCells = { entry: empty, speaker: empty, points: empty };

describe('scoringRows', () => {
	it('gives each speaker a row, entries in side order', () => {
		const rows = scoringRows(debateContext());

		expect(rows.map((row) => [row.ballot, row.sideLabel, row.student?.id])).toEqual([
			[11, 'Aff', 1001],
			[11, 'Aff', 1002],
			[12, 'Neg', 1003],
			[12, 'Neg', 1004],
		]);
	});

	it('uses the event\'s side labels', () => {
		const context = debateContext();
		const rows = scoringRows(debateContext({ debate: { ...context.debate, affLabel: 'Pro', negLabel: 'Con' } }));

		expect(rows.map((row) => row.sideLabel)).toEqual(['Pro', 'Pro', 'Con', 'Con']);
	});

	it('keeps an entry with no speakers as one row', () => {
		const context = debateContext();
		const rows = scoringRows(debateContext({ Entries: [{ ...context.Entries[0], Students: [] }, context.Entries[1]] }));

		expect(rows[0]).toMatchObject({ ballot: 11, student: null });
		expect(scoringRowId(rows[0])).toBe('ballot-11');
		expect(scoringRowId(rows[1])).toBe('student-1003');
	});
});

describe('sidesHeading', () => {
	const debate = debateContext().debate;

	it.each([
		[{ sides: 'locked', flipStatus: null }, 'Sides Set'],
		[{ sides: 'pick', flipStatus: null }, 'Select Side'],
		[{ sides: 'flip', flipStatus: null }, 'FLIP INCOMPLETE'],
		[{ sides: 'flip', flipStatus: 'winner' }, 'FLIP INCOMPLETE'],
		[{ sides: 'flip', flipStatus: 'done' }, 'FLIP COMPLETE'],
	] as const)('%o is %s', (sides, heading) => {
		expect(sidesHeading(debateContext({ debate: { ...debate, ...sides } }))).toBe(heading);
	});
});

describe('scoringColumns', () => {
	it('spans the entry columns and adds points when the round has them', () => {
		const columns = scoringColumns(debateContext(), cells);

		expect(columns.map((column) => column.id)).toEqual(['side', 'entry', 'speaker', 'points']);
		expect(columns.filter((column) => column.spanRows).map((column) => column.id)).toEqual(['side', 'entry']);
	});

	it('leaves out points when the round has none', () => {
		const context = debateContext();
		const columns = scoringColumns(debateContext({ scoring: { ...context.scoring, points: undefined } }), cells);

		expect(columns.map((column) => column.id)).toEqual(['side', 'entry', 'speaker']);
	});
});
