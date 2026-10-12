<script lang='ts'>
	import type { Snippet } from 'svelte';
	import type { BallotContext, OtherBallotContext } from '@tabroom/types';
	import WithSidebar from '$lib/layouts/WithSidebar.svelte';
	import BallotSidebar from './BallotSidebar.svelte';

	type Props = {
		context: Exclude<BallotContext, OtherBallotContext>;
		// Regions filled in by the scoring, feedback and submit components.
		// Each shows a placeholder until its component exists.
		errors?: Snippet;
		scoring?: Snippet;
		feedback?: Snippet;
		actions?: Snippet;
	};

	let { context, errors, scoring, feedback, actions }: Props = $props();

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

		{#if context.ballotHeader}
			<div class='prose prose-sm max-w-none rounded-md border border-border p-3'>
				{@html context.ballotHeader}
			</div>
		{/if}

		{#if context.topic}
			<!-- Classic capitalizes only TOPIC, not Motion or Resolution -->
			<div class='prose prose-lg max-w-none text-center font-semibold [--tw-prose-body:var(--color-primary-strong)]'>
				<span class:uppercase={context.topic.label === 'Topic'}>{context.topic.label}:</span>
				{@html context.topic.text}
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
			{#if scoring}
				{@render scoring()}
			{:else}
				{@render placeholder('Scoring')}
			{/if}
		</section>

		<section aria-label='Feedback'>
			{#if feedback}
				{@render feedback()}
			{:else}
				{@render placeholder('Feedback')}
			{/if}
		</section>

		<section aria-label='Submit'>
			{#if actions}
				{@render actions()}
			{:else}
				{@render placeholder('Submit')}
			{/if}
		</section>

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
