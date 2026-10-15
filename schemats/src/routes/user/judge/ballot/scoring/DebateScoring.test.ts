import type { ComponentProps } from 'svelte';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { debateContext } from '../../../../../storybook/stories/routes/user/judge/ballots/fixtures';
import DebateScoring from './DebateScoring.svelte';

// Northview AB (ballot 11, Aff): Avery Brooks 1001, Sam Delgado 1002.
// Central CD (ballot 12, Neg): Jordan Chen 1003, Riley Nakamura 1004. Points 26-30, steps of 0.1,
// low-point wins forbidden
const context = debateContext();
const confirmLowPoint = debateContext({ scoring: { ...context.scoring, winloss: { lpw: 'confirm' } } });

// onsubmit is also a Svelte option name, so the props go under props
const renderScoring = (props: ComponentProps<typeof DebateScoring>) => render(DebateScoring, { props });

const pointsFor = (name: string) => screen.getByRole('spinbutton', { name: `Points for ${name}` });
const submitButton = () => screen.getByRole('button', { name: 'Submit Ballot' });

async function fillBallot(user: ReturnType<typeof userEvent.setup>, winner: string, side: string) {
	await user.type(pointsFor('Avery Brooks'), '29');
	await user.type(pointsFor('Sam Delgado'), '28.5');
	await user.type(pointsFor('Jordan Chen'), '28');
	await user.type(pointsFor('Riley Nakamura'), '27.5');
	await user.selectOptions(screen.getByRole('combobox', { name: 'Winner' }), winner);
	await user.click(screen.getByRole('radio', { name: side }));
}

describe('DebateScoring', () => {
	it('spans each entry over its speakers', () => {
		renderScoring({ context, onsubmit: vi.fn() });

		expect(screen.getByRole('columnheader', { name: 'Sides Set' })).toBeInTheDocument();
		expect(screen.getByRole('cell', { name: 'Northview AB' })).toHaveAttribute('rowspan', '2');
	});

	it('keeps the input focused while the judge types', async () => {
		const user = userEvent.setup();
		renderScoring({ context, onsubmit: vi.fn() });

		const input = pointsFor('Avery Brooks');
		await user.type(input, '28.7');

		expect(pointsFor('Avery Brooks')).toBe(input);
		expect(input).toHaveFocus();
		expect(input).toHaveValue(28.7);
	});

	it('submits the scores', async () => {
		const user = userEvent.setup();
		const onsubmit = vi.fn();
		renderScoring({ context, onsubmit });

		await fillBallot(user, 'Northview AB', 'Aff');
		await user.click(submitButton());

		expect(onsubmit).toHaveBeenCalledWith({
			eventType: 'debate',
			winner: 11,
			winnerSide: 1,
			lowPointWin: false,
			points: [
				{ student: 1001, points: 29 },
				{ student: 1002, points: 28.5 },
				{ student: 1003, points: 28 },
				{ student: 1004, points: 27.5 },
			],
		});
	});

	it('submits an incomplete ballot as entered, for the server to check', async () => {
		const user = userEvent.setup();
		const onsubmit = vi.fn();
		renderScoring({ context, onsubmit });

		await user.type(pointsFor('Avery Brooks'), '31');
		await user.click(submitButton());

		expect(onsubmit).toHaveBeenCalledWith(expect.objectContaining({
			winner: null,
			winnerSide: null,
			points: [
				{ student: 1001, points: 31 },
				{ student: 1002, points: null },
				{ student: 1003, points: null },
				{ student: 1004, points: null },
			],
		}));
	});

	it('starts from the saved scores', () => {
		const saved = debateContext({
			debate: { ...context.debate, winner: 12 },
			Entries: context.Entries.map((entry) => ({
				...entry,
				Students: entry.Students.map((student, index) => ({ ...student, points: 28 + index })),
			})),
		});
		renderScoring({ context: saved, onsubmit: vi.fn() });

		expect(pointsFor('Sam Delgado')).toHaveValue(29);
		expect(screen.getByRole('combobox', { name: 'Winner' })).toHaveDisplayValue('Central CD');
		expect(screen.getByRole('radio', { name: 'Neg' })).toBeChecked();
	});

	it('only asks about a low-point win when the tournament allows one', () => {
		renderScoring({ context, onsubmit: vi.fn() });
		expect(screen.queryByRole('checkbox', { name: 'Low-Point Win?' })).not.toBeInTheDocument();
	});

	it('sends the low-point win the judge marked', async () => {
		const user = userEvent.setup();
		const onsubmit = vi.fn();
		renderScoring({ context: confirmLowPoint, onsubmit });

		await fillBallot(user, 'Central CD', 'Neg');
		await user.click(screen.getByRole('checkbox', { name: 'Low-Point Win?' }));
		await user.click(submitButton());

		expect(onsubmit).toHaveBeenCalledWith(expect.objectContaining({ winner: 12, winnerSide: 2, lowPointWin: true }));
	});
});
