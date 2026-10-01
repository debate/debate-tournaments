<script lang='ts'>

	let { row } = $props();

	import LaptopCodeSolid from 'flowbite-svelte-icons/LaptopCodeSolid.svelte';
	import UsersSolid from 'flowbite-svelte-icons/UsersSolid.svelte';
	import CodeForkSolid from 'flowbite-svelte-icons/CodeForkSolid.svelte';

</script>

	<div class='flex w-full text-center justify-around m-0'>

		{#if row.inPerson}
			<span
				class = "w-1/3 text-primary-strong
					hover:bg-primary-strong hover:text-white
					py-1"
				title = "{ row.inPerson } event{ row.inPerson > 1 ? 's are' : ' is' } in person"
			>
				<UsersSolid
					class = 'm-auto'
					size  = 'xs'
				/>
				<span class='hidden'>
					In Person
				</span>
			</span>
		{/if}

		{#if row.online}
			<span
				class = "
					w-1/3 text-danger
					hover:bg-danger hover:text-white
					py-1"
				title = "{ row.online } event{ row.online > 1 ? 's are' : ' is' } online"
			>
				<LaptopCodeSolid
					class = 'm-auto'
					size  = 'xs'
				/>
				<span class='hidden'>
					Online
				</span>
			</span>
		{/if}

		{#if row.hybrid}
			<span
				class = "
					w-1/3 text-tertiary
					hover:bg-tertiary hover:text-white
					py-1"
				title = "{ row.hybrid } event{ row.hybrid > 1 ? 's are' : ' is' } hybrid"
			>
				<CodeForkSolid
					class = 'm-auto'
					size  = "xs"
				/>
				<span class='hidden'>
					Hybrid
				</span>
			</span>
		{/if}

	</div>