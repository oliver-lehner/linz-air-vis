<script context="module">
	export const load = async ({ fetch }) => {
		try {
			const response = await fetch('air-data.json', {
				method: 'GET',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			return {
				props: { ...(await response.json()) }
			};
		} catch (error) {
			console.error(`Error in load function for /: ${error}`);
			return error;
		}
	};
</script>

<script lang="ts">
	export let data: AirData;
</script>

{#each Object.entries(data) as [stationKey, value]}
	<h1>{stationKey}</h1>
	{#each Object.entries(value) as [componentKey, componentValue]}
		<h2>{componentKey}</h2>
		{#each Object.entries(componentValue) as [itemKey, itemValue]}
			<h3>{itemKey}</h3>
			{#if Array.isArray(itemValue)}
				<dl>
					{#each itemValue as item}
						<dt>{new Date(item.time)}</dt>
						<dd>{item.value}</dd>
					{/each}
				</dl>
			{:else}
				<p>{itemValue}</p>
			{/if}
		{/each}
	{/each}
{/each}
