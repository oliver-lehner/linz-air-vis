<script lang="ts">
	import { stationNames } from '$lib/constants';
	import { currentStation } from '$lib/stores';
	import { fade } from 'svelte/transition';

	import { getLatest } from '$lib/utils';
	import ComponentDisplay from '$lib/ui/StationDetail/componentDisplay.svelte';
	import Compass from '$lib/ui/StationDetail/compass.svelte';
	import Linechart from './linechart.svelte';

	export let data: StationData;

	//$:console.log($currentStation)

</script>

<div class="station-container">
	<div class="header">
		<h2>{stationNames[$currentStation]}</h2>
		<Compass orientation={getLatest(data.WIR.hmw).value} speed={getLatest(data.WIV.hmw).value} />
		<div class="components">
			{#each Object.entries(data) as [componentKey, componentValues]}
				{#if componentKey != 'WIR' && componentKey != 'WIV' && componentValues.hmw.length > 0}
					<ComponentDisplay {componentKey} {componentValues} />
				{/if}
			{/each}
		</div>
	</div>

	<div class="charts">
		{#each Object.entries(data) as [componentKey, componentValue], index}
			{#if componentValue.hmw.length > 0 && !componentKey.startsWith('WI')}
					<div in:fade class="chart-container">
						{#key $currentStation}
							<Linechart component={componentKey} data={componentValue.hmw} />
						{/key}
					</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.station-container {
		width:100%;
		height: 42vh;
		padding: 0 1em;
		box-sizing: border-box;
		background-color: var(--dark-gray);
		color: var(--yellow);
	}

	.header {
		display: grid;
		grid-template-columns: 2fr 1fr;
		grid-template-areas: 'name compass' 'components compass';
		gap:0.1em;
		margin: 0.4em 0 0.6em;
		max-width: 80%;
	}

	h2 {
		grid-area: name;
	}

	.components {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(2em, 1fr));
		gap: 0.2em;
		width: 100%;
		grid-area: components;
	}

	.charts {
		display: flex;
		gap: 0.5em;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scroll-padding: 0 50%;
	}

	.chart-container {
		min-width:100%;
		max-height:30vh;
		display:flex;
		flex-direction: column;
		align-items: center;
		gap:0.2em;
		scroll-snap-align: center;
	}
</style>
