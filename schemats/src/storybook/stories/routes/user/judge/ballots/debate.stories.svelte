<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BallotLayout from '../../../../../../routes/user/judge/ballot/BallotLayout.svelte';
	import { debateContext } from './fixtures';

	const { Story } = defineMeta({
		title: 'Routes/User/Judge/Ballot/Debate',
		component: BallotLayout,
		parameters: {
			layout: 'fullscreen',
		},
	});
</script>

<Story name="Default" args={{ context: debateContext() }} />
