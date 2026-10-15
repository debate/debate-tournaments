<script lang='ts' module>
	import type { DebateBallotContext } from '@tabroom/types';

	type Context = DebateBallotContext;
</script>

<script lang='ts'>
	type Props = {
		context: Context;
		// The winning entry's ballot
		winner?: number | null;
		// The side the judge says the winner was on: 1 for Aff, 2 for Neg
		side?: number | null;
		// Set by the scoring component when the picks don't pass its checks
		error?: boolean;
	};

	let {
		context,
		winner = $bindable(context.debate.winner),
		side = $bindable(context.Entries.find((entry) => entry.ballot === context.debate.winner)?.side ?? null),
		error = false,
	}: Props = $props();

	const id = $props.id();

	const sides = $derived([
		{ value: 1, label: context.debate.affLabel },
		{ value: 2, label: context.debate.negLabel },
	]);
</script>

<!-- ballot.mhtml 2595-2665 -->
<div class='flex flex-wrap items-center gap-x-4 gap-y-2'>
	<label class='text-sm font-semibold text-primary-strong sm:w-1/5 sm:text-right' for='{id}-winner'>
		Winner
	</label>

	<!-- The forms plugin draws the arrow in the right padding, so keep pr-8 -->
	<select
		id='{id}-winner'
		class={['min-w-48 rounded border bg-surface py-1 pr-8 pl-2 text-sm', error ? 'border-danger' : 'border-border-strong']}
		aria-invalid={error}
		bind:value={winner}
	>
		<option value={null}>Choose Winning Entry</option>
		{#each context.Entries as entry (entry.ballot)}
			<option value={entry.ballot}>{entry.code}</option>
		{/each}
	</select>

	<div class='flex items-center gap-4 sm:ml-auto' aria-label='Winning side' role='radiogroup'>
		<span class='text-sm font-semibold text-primary-strong'>On the</span>
		{#each sides as { value, label } (value)}
			<label class='flex cursor-pointer items-center gap-1 text-sm'>
				<input name='{id}-side' type='radio' {value} bind:group={side} />
				{label}
			</label>
		{/each}
	</div>
</div>
