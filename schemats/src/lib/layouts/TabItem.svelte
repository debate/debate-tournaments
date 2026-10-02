<script lang='ts'>

	// Component to apply Tabroom standard formatting to the Tabs Flowbite
	// module item list.

	import { type TabitemProps } from 'flowbite-svelte';
	import {TabItem} from 'flowbite-svelte';

	const tabStyle = `
		inline-block text-sm font-medium text-center disabled:cursor-not-allowed p-3 px-4 rounded-t-sm
		font-semibold
	`;

	const defaultActiveClass = `
		${ tabStyle }
		active text-primary-strong bg-primary-soft
	`;

	const defaultInactiveClass = `
		${ tabStyle }
		hover:text-primary-deep hover:bg-accent-soft
	`;

	let {
		children,
		activeClass   = defaultActiveClass,
		inactiveClass = defaultInactiveClass,
		...restProps
	}: TabitemProps = $props();

</script>

	<TabItem
		activeClass   = { activeClass }
		inactiveClass = { inactiveClass }
		{ ...restProps }
	>
		{@render children?.()}
	</TabItem>
