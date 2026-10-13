<script lang='ts'>
	import type { Snippet } from 'svelte';
	import type { BallotContext, OtherBallotContext } from '@tabroom/types';
	import { CLASSIC_URL } from '$app/env/public';
	import WithSidebar from '$lib/layouts/WithSidebar.svelte';
	import BallotSidebar from './BallotSidebar.svelte';
	import Feedback from './Feedback.svelte';

	type Props = {
		context: Exclude<BallotContext, OtherBallotContext>;
		// The context carries no ids, but the feedback saves need them
		judgeId: number;
		panelId: number;
		// Regions filled in by the scoring component, which has its own submit.
		// Scoring shows a placeholder until the component exists.
		errors?: Snippet;
		scoring?: Snippet;
	};

	let { context, judgeId, panelId, errors, scoring }: Props = $props();

	const classicUrl = $derived(`${CLASSIC_URL}/user/judge/ballot.mhtml?panel_id=${panelId}&judge_id=${judgeId}`);

	const judgeName = $derived(
		[context.Judge.code, context.Judge.first, context.Judge.middle, context.Judge.last]
			.filter(Boolean)
			.join(' ')
	);

	// Classic only links the room for online rounds other than async
	const onlineRoom = $derived(context.onlineMode !== null && context.onlineMode !== 'async');

	// A rubric has its own rules for each row
	const pointsRules = $derived(context.scoring.points?.rubric ? undefined : context.scoring.points);

	const notedEntries = $derived(context.Entries.filter((entry) => entry.notes));
</script>

{#snippet placeholder(label: string)}
	<div class='rounded-md border-2 border-dashed border-border-strong p-6 text-center text-muted'>
		{label}
	</div>
{/snippet}

<WithSidebar>
	<div class='flex flex-col gap-3'>
		<!-- lg:me-4 keeps it clear of the sidebar toggle, like the header below -->
		<p class='my-0 rounded-md border border-warning bg-warning-soft px-3 py-2 text-sm text-text lg:me-4'>
			This is the beta ballot. If you have any issues,
			<a class='font-semibold underline hover:text-warning' href={classicUrl}>use the classic ballot</a>.
		</p>

		<!-- lg:pe-4 keeps the judge name clear of the sidebar toggle, which sits over the page's right edge -->
		<header class='flex flex-col gap-1 border-b border-border pb-2 sm:flex-row sm:items-start lg:pe-4'>
			<span class='sm:w-1/3'>
				{#if onlineRoom}
					{#if context.Room?.url}
						<a
							class='text-lg font-semibold text-primary-strong underline'
							href={context.Room.url}
							rel='noopener noreferrer'
							target='_blank'
						>{context.Room.name ? `Room ${context.Room.name}` : 'Room Link'}</a>
					{:else if context.Room}
						<p class='text-lg font-semibold text-primary-strong'>Room {context.Room.name}</p>
					{/if}
				{:else}
					<p class='text-lg font-semibold text-primary-strong'>
						{context.Room ? `Room: ${context.Room.name}` : 'NO ROOM ASSIGNED'}
					</p>
				{/if}
			</span>
			<span class='sm:w-1/3 sm:text-center'>
				<h4 class='my-0 text-muted'>
					{#if context.eventType !== 'mock_trial'}{context.Event.abbr}{/if}
					{context.Round.label ?? `${context.eventType === 'congress' ? 'Session' : 'Round'} ${context.Round.name ?? ''}`}
					{#if context.flight}Flt {context.flight}{/if}
				</h4>
			</span>
			<span class='sm:w-1/3 sm:text-right'>
				<h5 class='my-0'>{judgeName}</h5>
			</span>
		</header>

		{#if context.chair}
			<h6 class='my-0 text-center font-semibold uppercase text-muted'>
				{context.chairLabel ?? (context.eventType === 'congress' ? 'Parliamentarian' : 'Chair Judge')}
			</h6>
		{/if}

		{#if context.Round.notes}
			<!-- Display the round notes, converting URLs into clickable links -->
			<p class='rounded-md border-t-2 border-primary bg-warning-soft p-2 whitespace-pre-line text-warning'>
				Note: {#each context.Round.notes.split(/(https?:\/\/[^\s<]*[^\s<.,;:!?)\]'"])/) as part, index (index)}{#if index % 2}<a class='break-all underline' href={part} rel='noopener noreferrer' target='_blank'>{part}</a>{:else}{part}{/if}{/each}
			</p>
		{/if}

		{#if context.topic}
			<!-- Classic capitalizes only TOPIC, not Motion or Resolution -->
			<div class='max-w-none text-center font-semibold [--tw-prose-body:var(--color-primary-strong)]'>
				<span class:uppercase={context.topic.label === 'Topic'}>{context.topic.label}:</span>
				{@html context.topic.text}
			</div>
		{/if}

		{#if context.ballotHeader}
			<div class='prose prose-sm max-w-none rounded-md border border-border p-3'>
				{@html context.ballotHeader}
			</div>
		{/if}

		{#each context.rules as rule, index (index)}
			<div class='prose prose-sm max-w-none'>
				{@html rule}
			</div>
		{/each}

		{@render errors?.()}

		{#if pointsRules || notedEntries.length > 0}
			<div class='flex flex-col gap-2 border-t border-border pt-3'>
				{#if pointsRules}
					<p class='text-center font-semibold italic'>
						<span class='text-danger'>Points Rules:</span>
						<span class='text-primary-strong'>Range:</span>
						{pointsRules.min}-{pointsRules.max}.
						{#if pointsRules.step === 1}Whole points only.{/if}
						{pointsRules.ties ? 'Ties are OK.' : 'No ties.'}
						{#if pointsRules.ranksAgree}Ranks and points must agree.{/if}
						{#if context.scoring.winloss?.lpw === 'forbid'}Winner must have higher points.{/if}
						{#if pointsRules.step !== 1}Steps of {pointsRules.step}.{/if}
					</p>
				{/if}

				{#if notedEntries.length > 0}
					<div class='flex flex-col gap-1 text-center'>
						<span class='font-semibold text-danger'>Accomodation Notes</span>
						{#each notedEntries as entry (entry.ballot)}
							<!-- Notes come from a textarea, so keep their line breaks -->
							<p class='whitespace-pre-line'><span class='font-semibold'>{entry.code}:</span> {entry.notes}</p>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<section aria-label='Scoring'>
			<!-- The heading over the debate sides column (ballot.mhtml 1674-1686) -->
			{#if context.eventType === 'debate'}
				<div class='text-center text-sm font-semibold'>
					{#if context.debate.sides === 'flip'}
						{context.debate.flipStatus === 'done' ? 'FLIP COMPLETE' : 'FLIP INCOMPLETE'}
					{:else if context.debate.sides === 'pick'}
						Select Side
					{:else}
						Sides Set
					{/if}
				</div>
			{/if}

			{#if scoring}
				{@render scoring()}
			{:else}
				{@render placeholder('Scoring')}
			{/if}
		</section>

		<!-- Classic shows nothing here for Congress judges who aren't the chair, or mock trial without mock_trial_feedback -->
		{#if context.scoring.feedback}
			<section aria-label='Feedback'>
				<Feedback {context} {judgeId} {panelId} />
			</section>
		{/if}

		{#if context.ballotTopics}
			<div class='mt-4 border-t-2 border-primary pt-3'>
				<h6>Topics for {context.Round.label ?? `${context.eventType === 'congress' ? 'Session' : 'Round'} ${context.Round.name ?? ''}`}:</h6>
				<div class='prose prose-sm max-w-none'>
					{@html context.ballotTopics}
				</div>
			</div>
		{/if}
	</div>

	{#snippet sidebar()}
		<BallotSidebar {context} />
	{/snippet}
</WithSidebar>
