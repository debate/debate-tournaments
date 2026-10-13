<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BallotLayout from '../../../../../../routes/user/judge/ballot/BallotLayout.svelte';
	import { congressContext } from './fixtures';

	// The API sends Congress ballots to classic for now. These stories cover
	// what the UI can already render, so it's ready once the API supports them.
	const { Story } = defineMeta({
		title: 'Routes/User/Judge/Ballot/Congress',
		component: BallotLayout,
		args: { judgeId: 1, panelId: 1 },
		parameters: {
			layout: 'fullscreen',
		},
	});
</script>

<Story name="Default" args={{ context: congressContext() }} />
