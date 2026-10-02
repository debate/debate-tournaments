<script lang='ts' module>

	export type TabLink = {
		route            : string,
		label            : string,
		sort?            : number,
		matchPatterns?    : Array<string>,
		defaultSelected? : boolean,
		selected?        : boolean,
		tabClass?        : string,
	};

</script>
<script lang='ts'>

	import { page } from '$app/state';

	let { tabs }: {tabs: TabLink[]} = $props();

	let activeClass = `
		active
		text-primary-strong
		bg-surface
		hover:text-primary-deep hover:bg-surface-alt
	`;

	let inactiveClass = `
		text-text
		bg-page
	`;

	const processedTabs:TabLink[] = $derived(tabs.map( (tab) => {

		// Reset is necessary or state won't change
		tab.selected = false;
		tab.tabClass = inactiveClass;

		if (tab.label !== 'Main' && page.url.pathname.includes(tab.route)) {

			tab.selected = true;
			tab.tabClass = activeClass;

		} else if (tab.matchPatterns && tab.matchPatterns.length > 0) {

			tab.matchPatterns.forEach ( (matchPattern) => {
				if (page.url.pathname.includes(matchPattern)) {
					tab.selected = true;
					tab.tabClass = activeClass;
				}
			});
		}

		// Exact matches should always win.
		if (page.url.pathname === tab.route) {
			tab.selected = true;
			tab.tabClass = activeClass;
		}

		return tab;
	}));

</script>

<!--
	Scrolls sideways when the tabs don't fit. Left to overflow, they'd widen
	the whole page on phones, and the fixed sidebar drawer would end up off
	screen past the right edge.
-->
<ul
	class = 'flex space-x-2 rtl:space-x-reverse overflow-x-auto'
	role  = 'tablist'
>
	{#each processedTabs.sort((a, b) => (a.sort || 0) - (b.sort || 0)) as tab (tab.route)}
		<li class='group shrink-0 focus-within:z-10' role='presentation'>
			<a
				class ='{ tab.tabClass }
					inline-block p-2 px-4
					rounded-t-sm
					text-sm text-center
					disabled:cursor-not-allowed
					font-semibold
					hover:bg-accent-soft
				'
				aria-selected = '{ page.url.pathname.includes(tab.route) || tab.defaultSelected }'
				href          = {tab.route}
				role          = 'tab'
				title         = '{ tab.route } {page.url.pathname}'
				type          = 'button'
			>
				{tab.label}
			</a>
		</li>
	{/each}
</ul>