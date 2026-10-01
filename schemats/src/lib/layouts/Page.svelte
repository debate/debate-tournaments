<script lang="ts">
	let { pageData } = $props();
</script>

	<div
		class = "flex flex-wrap min-h-[80vh] override px-4"
	>
		<div class='
			flex w-full
			pl-4 pr-3
		'>
			<span class='
				w-1/2 resize-x grow
				py-2 content-start
			'>
				<h2>
					{ pageData.title }
				</h2>
			</span>

			{#if pageData.subtitle}
				<span
					class="w-1/2 p-4 content-start"
				>
					{ pageData.subtitle }
				</span>
			{/if}
		</div>

		<div
			class='flex w-full'
		>
			<span
				class="
					pt-4 pl-8 pr-4 pb-8
					w-[72%] resize-x grow
					content-start
					bg-surface
					border-t border-r
					border-primary-deep
					rounded-t-md
					border-l border-l-accent
				"
			>
				{@html pageData.content }
			</span>

			{#if pageData.sidebar || pageData.slug === 'help' }
				<span class="
					sidebar
					menu
					resize-x
					w-[28%]
					ms-2 ps-1
					pb-4
					content-start
					border-l border-l-border-strong
					bg-page
				">
					{@html pageData.sidebar }
				</span>
			{/if}

		</div>
	</div>