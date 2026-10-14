<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Ballot from './Ballot.svelte';
	import type { CurrentBallot } from '@tabroom/types';
	import { expect, waitFor, within } from 'storybook/test';

	const { Story } = defineMeta({
		component: Ballot,
		parameters: {
			layout: 'padded',
		},
	});

	function debateBallot(): CurrentBallot {
		return {
			id: 1,
			name: 1,
			flight: null,
			show_async: false,
			onlineBallots: true,
			flipStatus: null,
			legion: false,
			label: 'Round 1',
			JudgeId: 1,
			RoundId: 1,
			roomId: 1,
			roomName: 'Room 101',
			roomUrl: null,
			roomNotes: null,
			start: new Date().toISOString(),
			deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
			status: 'not_started',
			startText: null,
			ballotText: 'Please hit start right away so blah blah blah you know',
			chair: true,
			audited: false,
			TournTz: 'America/Chicago',
			eventName: 'Lincoln-Douglas Debate',
			eventAbbr: 'LD',
			eventType: 'debate',
			onlineMode: null,
			Entries: [
				{
					id: 1,
					side: 'Aff',
					speakerOrder: null,
					code: 'Test Prep XZ',
				},
				{
					id: 2,
					side: 'Neg',
					speakerOrder: null,
					code: 'Example High LY',
				},
			],
		};
	}
</script>

<Story name="Default" args={{ ballot: debateBallot() }}>
	{#snippet template(args)}
		<div class="w-full max-w-3xl mx-auto">
			<Ballot {...args} />
		</div>
	{/snippet}
</Story>
<Story name="PF" args={{ ballot: { ...debateBallot(), flipStatus: 'loser',
	eventName: 'Public Forum Debate', eventAbbr: 'PF', eventType: 'debate',
	Entries: [
		{
			id: 1,
			side: null,
			speakerOrder: null,
			code: 'Test Prep XZ',
		},
		{
			id: 2,
			side: null,
			speakerOrder: null,
			code: 'Example High LY',
		},
	],
}}}>
	{#snippet template(args)}
		<div class="w-full max-w-3xl mx-auto">
			<Ballot {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Flighted" args={{ ballot: { ...debateBallot(), flight: 2 } }}>
	{#snippet template(args)}
		<div class="w-full max-w-3xl mx-auto">
			<Ballot {...args} />
		</div>
	{/snippet}
</Story>

<Story name="No Online Ballots" args={{ ballot: { ...debateBallot(), onlineBallots: false } }}>
	{#snippet template(args)}
		<div class="w-full max-w-3xl mx-auto">
			<Ballot {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Mock Trial" args={{ ballot: { ...debateBallot(), label: 'Round 1', roomName: 'Courtroom 1',
	eventName: 'Mock Trial', eventAbbr: 'MT', eventType: 'mock_trial' }}}>
	{#snippet template(args)}
		<div class="w-full max-w-3xl mx-auto">
			<Ballot {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Congress" args={{ ballot: { ...debateBallot(), label: 'Session 1', roomName: 'Room 101',
	eventName: 'Congressional Debate', eventAbbr: 'CON', eventType: 'congress' } }}>
	{#snippet template(args)}
		<div class="w-full max-w-3xl mx-auto">
			<Ballot {...args} />
		</div>
	{/snippet}
</Story>

<Story name="American Legion" args={{ ballot: { ...debateBallot(), legion: true,
	eventName: 'American Legion Oratorical', eventAbbr: null }}}>
	{#snippet template(args)}
		<div class="w-full max-w-3xl mx-auto">
			<Ballot {...args} />
		</div>
	{/snippet}
</Story>

<Story name="WUDC Panelist" args={{ ballot: { ...debateBallot(), chair: false,
	eventName: 'British Parliamentary', eventAbbr: 'BP', eventType: 'wudc',
	Entries: [
		{
			id: 1,
			side: '1G',
			speakerOrder: null,
			code: 'Test Prep XZ',
		},
		{
			id: 2,
			side: '1O',
			speakerOrder: null,
			code: 'Example High LY',
		},
		{
			id: 3,
			side: '2G',
			speakerOrder: null,
			code: 'Fake Academy PS',
		},
		{
			id: 4,
			side: '2O',
			speakerOrder: null,
			code: 'Not Real WQ',
		},
	],
} }}>
	{#snippet template(args)}
		<div class="w-full max-w-3xl mx-auto">
			<Ballot {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Speech" args={{ ballot: { ...debateBallot(), chair: false,
	eventName: 'Original Oratory', eventAbbr: 'OO', eventType: 'speech',
	Entries: [
		{
			id: 1,
			side: null,
			speakerOrder: 1,
			code: 'Test Prep XZ',
		},
		{
			id: 2,
			side: null,
			speakerOrder: 2,
			code: 'Example High LY',
		},
		{
			id: 3,
			side: null,
			speakerOrder: 3,
			code: 'Fake Academy PS',
		},
		{
			id: 4,
			side: null,
			speakerOrder: 4,
			code: 'Not Real WQ',
		},
		{
			id: 5,
			side: null,
			speakerOrder: 5,
			code: 'Fake Academy PS',
		},
		{
			id: 6,
			side: null,
			speakerOrder: 6,
			code: 'Not Real WQ',
		},
	],
} }}
	play={async ({ canvasElement }) => {
		// Speakers 1-3 fill the first column and 4-6 the second
		const canvas = within(canvasElement);
		const first = canvas.getByText('Test Prep XZ');
		const fourth = canvas.getAllByText('Not Real WQ')[0];
		await waitFor(() => expect(fourth.offsetLeft).toBeGreaterThan(first.offsetLeft));
	}}
>
	{#snippet template(args)}
		<div class="w-full max-w-3xl mx-auto">
			<Ballot {...args} />
		</div>
	{/snippet}
</Story>
<Story name="Speech Long Codes" args={{ ballot: { ...debateBallot(), chair: false,
	eventName: 'Original Oratory', eventAbbr: 'OO', eventType: 'speech',
	Entries: [
		'Thomas Jefferson High School for Science and Technology AB',
		'Example High CD',
		'Fake Academy EF',
		'Not Real Preparatory School GH',
	].map((code, i) => ({ id: i + 1, side: null, speakerOrder: i + 1, code })),
} }}
	play={async ({ canvasElement }) => {
		// The longest code doesn't fit in half the width, so the entries stack one wide
		const canvas = within(canvasElement);
		const first = canvas.getByText(/^Thomas Jefferson/);
		const third = canvas.getByText('Fake Academy EF');
		await waitFor(() => expect(third.offsetLeft).toBe(first.offsetLeft));
	}}
>
	{#snippet template(args)}
		<div class="w-full max-w-3xl mx-auto">
			<Ballot {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Several Ballots">
	{#snippet template()}
		<div class="mx-auto flex w-full max-w-6xl flex-col gap-2">
			<Ballot ballot={debateBallot()} />
			<Ballot ballot={{ ...debateBallot(), id: 2, flight: 2, flipStatus: 'loser', ballotText: null,
				roomName: 'PF Zoom 4', roomUrl: 'https://example.com/zoom', roomNotes: 'Password is 1234',
				eventName: 'Public Forum Debate', eventAbbr: 'PF',
				Entries: [
					{ id: 3, side: null, speakerOrder: null, code: 'Lakeside AB' },
					{ id: 4, side: null, speakerOrder: null, code: 'Riverdale Prep CD' },
				] }} />
			<Ballot ballot={{ ...debateBallot(), id: 3, name: 2, status: 'started', ballotText: null,
				roomName: 'Room 214', eventName: 'Original Oratory', eventAbbr: 'OO', eventType: 'speech',
				Entries: [1, 2, 3, 4, 5, 6].map(n => ({ id: 10 + n, side: null, speakerOrder: n, code: `${100 + n}` })) }} />
			<Ballot ballot={{ ...debateBallot(), id: 4, name: 1, label: 'Session 1', ballotText: null,
				roomName: 'Senate Chamber', eventName: 'Congressional Debate', eventAbbr: 'CON', eventType: 'congress',
				Entries: [] }} />
		</div>
	{/snippet}
</Story>

<Story name="Phone Width" args={{ ballot: { ...debateBallot(), flight: 2, flipStatus: 'loser',
	roomName: 'PF Zoom 4', roomUrl: 'https://example.com/zoom', roomNotes: 'Password is 1234',
	eventName: 'Public Forum Debate', eventAbbr: 'PF' } }}>
	{#snippet template(args)}
		<div class="max-w-sm">
			<Ballot {...args} />
		</div>
	{/snippet}
</Story>
