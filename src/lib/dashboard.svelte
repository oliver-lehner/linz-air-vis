<script lang="ts">
	import { getLatest } from '$lib/utils';
	import { componentColors, componentNames, stationNames } from '$lib/constants';
	import { currentStation } from '$lib/stores';

	export let data: AirData;
</script>

<div class="container">
	{#if data}
		{#each Object.entries(data) as [stationKey, stationValues]}
			<div class="cell">
				<h2 on:click={() => ($currentStation = stationKey)}>{stationNames[stationKey]}</h2>
				<p />
				<div class="components">
					{#each Object.entries(stationValues) as [componentKey, componentValues]}
						{#if componentKey != 'WIR' && componentKey != 'WIV' && componentValues.hmw.length > 0}
							<div style={`background-color: ${componentColors[componentKey]}`}>
								<p>{@html componentNames[componentKey]}</p>
								<p style={`background-color: ${'red'}`}>{getLatest(componentValues.hmw).value.toFixed(1)}</p>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.container {
	position: absolute;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(10em, 2fr));
		gap: 0.5em;
		box-sizing: border-box;
		width: 100%;
		max-height:20vh;
		overflow:scroll;
		padding: 0.5em;
		background: var(--dark-gray);
		border: 2px solid var(--green);

	}

	.container h2,
	p {
		color: var(--yellow);
	}

	h2 {
		margin: 0 0 0.5em 0;
		font-weight: 600;
		font-size: 1.2em;
	}

	.components {
		display: flex;
		gap: 0.2em;
		align-items: stretch;
	}

	.components p {
		font-size: 0.6em;
		white-space: nowrap;
		text-align: center;
		line-height: 1.5;
		border-radius: 0.1em;

	}


	.components > div {
		overflow: hidden;
		border-radius: 0.1em;
		padding: 0.1em 0.2em;
	}


</style>
