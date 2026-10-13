<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';
	import { HttpResponse, http } from 'msw';
	import { getRestJudgesBallotContextMockHandler } from '$indexcards/index.msw';
	import BallotPage from '../../../../../../routes/user/judge/ballot/+page.svelte';
	import { debateContext } from './fixtures';

	// The ballot page: the beta notice and ballot, or the way to classic when the beta can't render it
	const { Story } = defineMeta({
		title: 'Routes/User/Judge/Ballot/Page',
		component: BallotPage,
		// The page reads only the ids, not the session and query client from the parent layouts
		args: { data: { judgeId: 1, panelId: 2 } as ComponentProps<typeof BallotPage>['data'] },
		parameters: {
			layout: 'fullscreen',
		},
	});

	const classicHref = /\/user\/judge\/ballot\.mhtml\?panel_id=2&judge_id=1$/;
</script>

<Story
	name="Beta Ballot"
	parameters={{ msw: { handlers: [getRestJudgesBallotContextMockHandler(debateContext())] } }}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(await canvas.findByText(/This is the beta ballot/)).toBeInTheDocument();
		await expect(canvas.getByRole('link', { name: 'use the classic ballot' })).toHaveAttribute('href', expect.stringMatching(classicHref));
		await expect(canvas.getByRole('heading', { name: 'Feedback' })).toBeInTheDocument();
	}}
/>

<Story
	name="Unsupported"
	parameters={{
		msw: {
			handlers: [getRestJudgesBallotContextMockHandler({ eventType: 'other', judge: 1, panel: 2, tourn: 1, supported: false })],
		},
	}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(await canvas.findByText('This ballot uses features that are unsupported on the beta')).toBeInTheDocument();
		await expect(canvas.getByRole('link', { name: 'enter it on classic Tabroom' })).toHaveAttribute('href', expect.stringMatching(classicHref));
	}}
/>

<Story
	name="Load Error"
	parameters={{
		msw: {
			handlers: [
				http.get('*/rest/judges/:judgeId/panels/:panelId/ballots', () => HttpResponse.json(
					{ type: 'about:blank', title: 'Not Found', status: 404, detail: 'That judge does not have a ballot in that room.' },
					{ status: 404 },
				)),
			],
		},
	}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(await canvas.findByText('This ballot couldn\'t be loaded')).toBeInTheDocument();
	}}
/>
