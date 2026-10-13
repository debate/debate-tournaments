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

	// An elim where the entries flip for sides online, with the flip at the given step
	const flipContext = (flipStatus: 'winner' | 'done') => debateContext({
		Round: { id: 6, name: 6, label: 'Quarterfinals', notes: null },
		debate: { affLabel: 'Aff', negLabel: 'Neg', sides: 'flip', flipStatus, winner: null },
	});
</script>

<Story name="Default" args={{ context: debateContext() }} />

<Story name="Flip Incomplete" args={{ context: flipContext('winner') }} />

<Story name="Flip Complete" args={{ context: flipContext('done') }} />
