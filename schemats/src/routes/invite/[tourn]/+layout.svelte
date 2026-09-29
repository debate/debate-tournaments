<script lang="ts">

	// Tournament Invitation layout shell.
	// WIP: Figuring out how to get a sidebar to work with uplift

	import { resolve } from '$app/paths';
	import { indexFetch } from '$lib/indexfetch';
	import type { TournInvite } from '@tabroom/types';
	import { setContext } from 'svelte';

	import Loading from '$lib/layouts/Loading.svelte';
	import MainTitle from '$lib/layouts/MainTitle.svelte';

	import { ucfirst } from '$lib/helpers/text';
	import { showDateRange } from '$lib/helpers/dt';
    import TabLinks from '$lib/layouts/TabLinks.svelte';

	import { shortZone } from '$lib/helpers/dt';

    import type { Snippet } from 'svelte';
	import type { Tourn } from '$indexcards/schemas';
	import type { TabLink } from '$lib/layouts/TabLinks.svelte';

	// This pattern leads to reactive data display in Svelte 5 & TanStack,
	// which is otherwise tricky. It cost me dearly to discover this wisdom.
	let { data, children }: {data: Tourn, children:Snippet} = $props();

	let tourn:Tourn = $derived.by( () => {
		return { ... data};
	});

	// Keep access to the URL path and Tourn ID throughout this segment. I'm
	// not sure this is the best way to do it, but it is a way.

	// svelte-ignore state_referenced_locally
	setContext('webnameTourn', tourn);
	const pageContent = $derived(indexFetch<TournInvite>(`/rest/tourns/${tourn.id}/invite`));
	let sort = 0;

	const tabs:TabLink[] = $derived.by( () => {
		const params = { tourn: tourn.webname };
		const routes = {
			main     : resolve('/invite/[tourn]', params),
			events   : resolve('/invite/[tourn]/events', params),
			register : resolve('/invite/[tourn]/register', params),
			rounds   : resolve('/invite/[tourn]/rounds', params),
			results  : resolve('/invite/[tourn]/results', params),
		};

		return (Object.keys(routes) as Array<keyof typeof routes>).map( (pageKey) => {

			const route = routes[pageKey];
			const matchPatterns = [];

			if (pageKey === 'main') {
				matchPatterns.push(`/invite/${tourn.webname}/page/`);
				matchPatterns.push(`/invite/${tourn.id}/page/`);
			}

			if (pageKey === 'rounds') {
				matchPatterns.push(`/invite/${tourn.webname}/entries/`);
				matchPatterns.push(`/invite/${tourn.id}/page/`);
				matchPatterns.push(`/invite/${tourn.id}/rounds/`);
			}

			sort++;
			return	{
				route,
				label : ucfirst(pageKey) || '',
				sort,
				matchPatterns,
			};
		});
	});

	let ranges = $derived.by( () => {
		return showDateRange({
			endISO   : pageContent.data?.end,
			startISO : pageContent.data?.start,
			format   : 'medday',
			mode     : 'date',
			showTz   : true,
			tz       : pageContent.data?.tz,
		});
	});

	let tournLocation = $derived.by( () => {
		const invite = pageContent.data;
		if (!invite) return '';
		if (invite.inPerson == 0 && invite.hybrid == 0) {
			let site = `${ invite.city || 'Online'} `;
			site += shortZone(invite.tz);
			return site;
		};
		return `${invite.city}, ${invite.state || invite.country}`;
	});

</script>

	{#if pageContent.status !== 'success' || pageContent.isPending}
		<Loading tanstackJob={pageContent} />
	{:else}

		<div class="
			w-full
			px-4
			ps-8
			bg-back-200
		">
			<!-- svelte-ignore attribute_quoted -->
			<MainTitle
				subtitle   = '{tournLocation}'
				title      = '{pageContent.data.name}'
				undertitle = {ranges?.dateOutput}
			>
			</MainTitle>

			<div class='block invitePage'>
				<TabLinks tabs={tabs} />
				<div
					class="flex w-full
					border-t-2 border-secondary-400
				">
					{@render children() }
				</div>
			</div>
		</div>
	{/if}
