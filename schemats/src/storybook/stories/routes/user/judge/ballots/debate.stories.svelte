<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import { HttpResponse, http } from 'msw';
	import type { BallotValidationProblem, DebateBallotReview } from '@tabroom/types';
	import { getRestJudgesBallotConfirmMockHandler, getRestJudgesBallotSaveMockHandler } from '$indexcards/index.msw';
	import BallotLayout from '../../../../../../routes/user/judge/ballot/BallotLayout.svelte';
	import { debateContext } from './fixtures';

	const { Story } = defineMeta({
		title: 'Routes/User/Judge/Ballot/Debate',
		component: BallotLayout,
		args: { judgeId: 1, panelId: 1 },
		parameters: {
			layout: 'fullscreen',
		},
	});

	// An elim where the entries flip for sides online, with the flip at the given step
	const flipContext = (flipStatus: 'winner' | 'done') => debateContext({
		Round: { id: 6, name: 6, label: 'Quarterfinals', notes: null },
		debate: { affLabel: 'Aff', negLabel: 'Neg', sides: 'flip', flipStatus, winner: null },
	});

	// Fills in a valid ballot, Northview AB winning on the Aff, and submits it
	async function submitBallot(canvasElement: HTMLElement) {
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
		await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Winner' }), 'Northview AB');
		await userEvent.click(canvas.getByRole('radio', { name: 'Aff' }));
		await userEvent.click(canvas.getByRole('button', { name: 'Submit Ballot' }));
	}

	// The server's 422 for a ballot whose RFD is too short
	const refused: BallotValidationProblem = {
		type: 'about:blank',
		title: 'Ballot has errors',
		status: 422,
		errors: [
			{ field: 'rfd', message: 'This tournament requires a Reason for Decision. Please leave at least 50 words. (You left 0)' },
		],
	};

	const saved: DebateBallotReview = {
		eventType: 'debate',
		saved: true,
		winner: 11,
		lowPointWin: false,
		bestPO: null,
		Entries: [
			{
				ballot: 11, entry: 101, code: 'Northview AB', sideLabel: 'Aff',
				Students: [{ id: 1001, first: 'Avery', last: 'Brooks', points: 29 }, { id: 1002, first: 'Sam', last: 'Delgado', points: 28.5 }],
			},
			{
				ballot: 12, entry: 102, code: 'Central CD', sideLabel: 'Neg',
				Students: [{ id: 1003, first: 'Jordan', last: 'Chen', points: 28 }, { id: 1004, first: 'Riley', last: 'Nakamura', points: 27.5 }],
			},
		],
	};
</script>

<Story name="Default" args={{ context: debateContext() }} />

<Story name="Flip Incomplete" args={{ context: flipContext('winner') }} />

<Story name="Flip Complete" args={{ context: flipContext('done') }} />

<!-- The server refuses the ballot: its errors show above the points rules -->
<Story
	name="Server Errors"
	args={{ context: debateContext() }}
	parameters={{
		msw: {
			handlers: [http.put('*/rest/judges/:judgeId/panels/:panelId/ballots', () => HttpResponse.json(refused, { status: 422 }))],
		},
	}}
	play={async ({ canvasElement }) => {
		await submitBallot(canvasElement);

		const canvas = within(canvasElement);
		await expect(await canvas.findByText('Oh, drat. Your ballot had errors.')).toBeInTheDocument();
		await expect(canvas.getByText(refused.errors[0].message)).toBeInTheDocument();
	}}
/>

<!-- Any edit clears the errors until the next submit -->
<Story
	name="Errors Clear On Edit"
	args={{ context: debateContext() }}
	parameters={{
		msw: {
			handlers: [http.put('*/rest/judges/:judgeId/panels/:panelId/ballots', () => HttpResponse.json(refused, { status: 422 }))],
		},
	}}
	play={async ({ canvasElement }) => {
		await submitBallot(canvasElement);

		const canvas = within(canvasElement);
		await expect(await canvas.findByText('Oh, drat. Your ballot had errors.')).toBeInTheDocument();

		await userEvent.type(canvas.getByRole('spinbutton', { name: 'Points for Avery Brooks' }), '5');
		await expect(canvas.queryByText('Oh, drat. Your ballot had errors.')).not.toBeInTheDocument();
	}}
/>

<!-- A saved ballot opens "Is this correct?"; confirming it (through classic for now) locks the scores -->
<Story
	name="Confirm"
	args={{ context: debateContext() }}
	parameters={{
		msw: {
			handlers: [
				getRestJudgesBallotSaveMockHandler(saved),
				getRestJudgesBallotConfirmMockHandler({ status: 'confirmed', Entries: [], flipStatus: null }),
			],
		},
	}}
	play={async ({ canvasElement }) => {
		await submitBallot(canvasElement);

		// The popup renders outside the story's canvas
		const page = within(canvasElement.ownerDocument.body);
		await expect(await page.findByText('Is this correct?')).toBeInTheDocument();
		await userEvent.click(page.getByRole('button', { name: 'Yes, confirm' }));

		await expect(await within(canvasElement).findByText(/This ballot has been entered and confirmed already/)).toBeInTheDocument();
	}}
/>

<!-- The API couldn't confirm: the scores are saved, and classic can still confirm them -->
<Story
	name="Confirm Fails"
	args={{ context: debateContext() }}
	parameters={{
		msw: {
			handlers: [
				getRestJudgesBallotSaveMockHandler(saved),
				http.post('*/rest/judges/:judgeId/panels/:panelId/ballots/confirm', () => HttpResponse.json({
					type: 'about:blank',
					title: 'The Server is temporarily unable to handle the request.',
					status: 503,
					detail: 'Your ballot was saved but couldn\'t be confirmed. Confirm it on classic Tabroom',
				}, { status: 503 })),
			],
		},
	}}
	play={async ({ canvasElement }) => {
		await submitBallot(canvasElement);

		const page = within(canvasElement.ownerDocument.body);
		await userEvent.click(await page.findByRole('button', { name: 'Yes, confirm' }));

		await expect(await page.findByRole('link', { name: 'Confirm on classic Tabroom' })).toHaveAttribute('href', expect.stringMatching(/ballot_confirm\.mhtml\?panel_id=1&judge_id=1$/));
	}}
/>

<Story name="Already Confirmed" args={{ context: debateContext({ status: 'confirmed' }) }} />
