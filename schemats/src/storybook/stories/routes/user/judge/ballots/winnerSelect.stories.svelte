<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import WinnerSelect from '../../../../../../routes/user/judge/ballot/WinnerSelect.svelte';
	import { debateContext } from './fixtures';

	// The win/loss picker (ballot.mhtml 2595-2665); the scoring component checks the picks
	const { Story } = defineMeta({
		title: 'Routes/User/Judge/Ballot/WinnerSelect',
		component: WinnerSelect,
	});

	const debate = debateContext();
</script>

<Story name="Default" args={{ context: debate }} />

<Story
	name="Saved Winner"
	args={{ context: debateContext({ debate: { ...debate.debate, winner: 12 } }) }}
/>

<Story
	name="Custom Side Labels"
	args={{ context: debateContext({ debate: { ...debate.debate, affLabel: 'Pro', negLabel: 'Con' } }) }}
/>

<!-- Northview AB was Aff, so the scoring component flags Neg -->
<Story name="Error" args={{ context: debate, winner: 11, side: 2, error: true }} />

<Story
	name="Pick Winner"
	args={{ context: debate }}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const select = canvas.getByRole('combobox', { name: 'Winner' });

		await userEvent.selectOptions(select, 'Northview AB');
		await userEvent.click(canvas.getByRole('radio', { name: 'Aff' }));

		await expect(select).toHaveDisplayValue('Northview AB');
		await expect(canvas.getByRole('radio', { name: 'Aff' })).toBeChecked();
	}}
/>

<!-- Classic unchecks the side on a new winner; this keeps it for the scoring component to flag -->
<Story
	name="Change Winner"
	args={{ context: debate }}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const select = canvas.getByRole('combobox', { name: 'Winner' });

		await userEvent.selectOptions(select, 'Northview AB');
		await userEvent.click(canvas.getByRole('radio', { name: 'Aff' }));
		await userEvent.selectOptions(select, 'Central CD');

		await expect(select).toHaveDisplayValue('Central CD');
		await expect(canvas.getByRole('radio', { name: 'Aff' })).toBeChecked();
	}}
/>
