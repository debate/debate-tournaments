<script lang="ts">

	import { resolve } from '$app/paths';
	import { CalendarMonthSolid } from 'flowbite-svelte-icons';

	let {row, column} = $props();

	let linkUrl = $derived(column.linkFunction(row));

</script>
<span
class = "w-1/3 text-primary-strong hover:text-primary-deep py-1"
>
<a href="{resolve(linkUrl,{})}">
	<CalendarMonthSolid
		class = 'm-auto '
		size  = 'sm'
	/>
</a>
</span>