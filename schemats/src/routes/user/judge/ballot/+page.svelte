<script lang="ts">
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
</script>

<h2>Ballot</h2>
<p>Judge {data.judgeId}, panel {data.panelId}</p>
