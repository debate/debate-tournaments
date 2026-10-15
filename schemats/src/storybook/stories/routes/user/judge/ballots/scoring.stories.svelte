<script lang="ts" module>
	import type { DebateBallotContext } from '@tabroom/types';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from 'storybook/test';
	import DebateScoring from '../../../../../../routes/user/judge/ballot/scoring/DebateScoring.svelte';
	import { debateContext } from './fixtures';

	// The debate scoring table, winner and submit (ballot.mhtml 1570-2891). The server checks
	// the scores; the layout shows its errors (Debate / Server Errors)
	const { Story } = defineMeta({
		title: 'Routes/User/Judge/Ballot/Scoring',
		component: DebateScoring,
		args: { onsubmit: fn() },
	});

	const debate = debateContext();

	const withScoring = (scoring: Partial<DebateBallotContext['scoring']>) =>
		debateContext({ scoring: { ...debate.scoring, ...scoring } });

	// Fills the points with Northview AB ahead, then picks the given winner and side
	async function fillBallot(canvasElement: HTMLElement, winner: string, side: string) {
		const canvas = within(canvasElement);
		const points: [string, string][] = [
			['Avery Brooks', '29'],
			['Sam Delgado', '28.5'],
			['Jordan Chen', '28'],
			['Riley Nakamura', '27.5'],
		];
		for (const [name, value] of points) {
			await userEvent.type(canvas.getByRole('spinbutton', { name: `Points for ${name}` }), value);
		}
		await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Winner' }), winner);
		await userEvent.click(canvas.getByRole('radio', { name: side }));
	}

	const fourSpeakers = debateContext({
		Event: { abbr: 'WSD' },
		Entries: debate.Entries.map((entry, index) => ({
			...entry,
			Students: [
				...entry.Students,
				{ id: 1005 + index * 2, first: 'Morgan', middle: null, last: `Ellis${index}`, pronoun: null, points: null },
				{ id: 1006 + index * 2, first: 'Parker', middle: null, last: `Hale${index}`, pronoun: null, points: null },
			],
		})),
	});
</script>

<Story name="Default" args={{ context: debate }} />

<Story
	name="Saved Scores"
	args={{
		context: debateContext({
			debate: { ...debate.debate, winner: 11 },
			Entries: debate.Entries.map((entry, index) => ({
				...entry,
				Students: entry.Students.map((student, order) => ({ ...student, points: 29 - index - order * 0.5 })),
			})),
		}),
	}}
/>

<Story
	name="Flip Incomplete"
	args={{ context: debateContext({ debate: { ...debate.debate, sides: 'flip', flipStatus: 'winner' } }) }}
/>

<Story
	name="Flip Complete"
	args={{ context: debateContext({ debate: { ...debate.debate, sides: 'flip', flipStatus: 'done' } }) }}
/>

<!-- Win/loss only: no points column -->
<Story name="No Points" args={{ context: withScoring({ points: undefined }) }} />

<Story
	name="Whole Points, Ties OK"
	args={{ context: withScoring({ points: { ...debate.scoring.points!, min: 20, max: 30, step: 1, ties: true } }) }}
/>

<Story name="Four Speakers" args={{ context: fourSpeakers }} />

<Story
	name="Doubled Entry"
	args={{ context: debateContext({ Entries: debate.Entries.map((entry, index) => ({ ...entry, doubled: index === 0 ? 1 : 0 })) }) }}
/>

<Story
	name="Submit"
	args={{ context: debate }}
	play={async ({ canvasElement, args }) => {
		await fillBallot(canvasElement, 'Northview AB', 'Aff');
		await userEvent.click(within(canvasElement).getByRole('button', { name: 'Submit Ballot' }));

		await expect(args.onsubmit).toHaveBeenCalledWith(expect.objectContaining({ winner: 11, winnerSide: 1, lowPointWin: false }));
	}}
/>

<!-- The tournament allows a confirmed low-point win, so the judge can mark it before submitting -->
<Story
	name="Low-Point Win Allowed"
	args={{ context: withScoring({ winloss: { lpw: 'confirm' } }) }}
	play={async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await fillBallot(canvasElement, 'Central CD', 'Neg');
		await userEvent.click(canvas.getByRole('checkbox', { name: 'Low-Point Win?' }));
		await userEvent.click(canvas.getByRole('button', { name: 'Submit Ballot' }));

		await expect(args.onsubmit).toHaveBeenCalledWith(expect.objectContaining({ winner: 12, lowPointWin: true }));
	}}
/>
