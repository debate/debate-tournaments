<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BallotLayout from '../../../../../../routes/user/judge/ballot/BallotLayout.svelte';
	import { mockTrialContext } from './fixtures';

	// The API sends mock trial ballots to classic for now. These stories cover
	// what the UI can already render, so it's ready once the API supports them.
	const { Story } = defineMeta({
		title: 'Routes/User/Judge/Ballot/Mock Trial',
		component: BallotLayout,
		parameters: {
			layout: 'fullscreen',
		},
	});
</script>

<Story
	name="Default"
	args={{
		context: mockTrialContext({
			otherJudges: [
				{ first: 'Dana', middle: 'L', last: 'Whitfield', chair: true, pronoun: 'she/her' },
				{ first: 'Chris', middle: null, last: 'Alvarez', chair: false, pronoun: 'he/him' },
			],
		}),
	}}
/>
