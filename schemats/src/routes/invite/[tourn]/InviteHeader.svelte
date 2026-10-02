<script lang="ts">

	// Tournament title, dates and tabs, rendered by the invite layout above
	// the page and its sidebar. The layout only renders this once the invite
	// data has loaded, so the fetch here is served from the query cache.

	import { resolve } from '$app/paths';
	import { indexFetch } from '$lib/indexfetch';
	import type { TournInvite } from '@tabroom/types';
	import { getContext } from 'svelte';

	import MainTitle from '$lib/layouts/MainTitle.svelte';
	import TabLinks from '$lib/layouts/TabLinks.svelte';

	import { ucfirst } from '$lib/helpers/text';
	import { showDateRange, shortZone } from '$lib/helpers/dt';

	import type { Tourn } from '$indexcards/schemas';
	import type { TabLink } from '$lib/layouts/TabLinks.svelte';

	const tourn:Tourn = getContext('webnameTourn');
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

	<div class="invite-header border-b-2 border-accent">
		<!-- svelte-ignore attribute_quoted -->
		<MainTitle
			subtitle   = '{tournLocation}'
			title      = '{pageContent.data?.name ?? tourn.name}'
			undertitle = {ranges?.dateOutput}
		>
		</MainTitle>

		<TabLinks tabs={tabs} />
	</div>
