<script lang='ts'>
	type Props = {
		// Names the input for screen readers, e.g. "Points for Avery Brooks"
		label: string;
		// Hints for the browser's spinner; the server checks the points
		min: number;
		max: number;
		step: number;
		value?: number | null;
	};

	let { label, min, max, step, value = $bindable(null) }: Props = $props();

	// An empty or unreadable number input binds as undefined; the draft keeps blanks as null
	const getValue = () => value;
	const setValue = (next: number | null | undefined) => {
		value = typeof next === 'number' && !Number.isNaN(next) ? next : null;
	};
</script>

<input
	class='w-20 rounded border border-border-strong bg-surface px-2 py-0.5 text-sm'
	aria-label={label}
	inputmode='decimal'
	{max}
	{min}
	{step}
	type='number'
	bind:value={getValue, setValue}
/>
