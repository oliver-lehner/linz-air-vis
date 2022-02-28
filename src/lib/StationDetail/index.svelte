<script lang="ts">
	import Linechart from './linechart.svelte';
	import { stationNames } from '$lib/constants';
	import { currentStation } from '$lib/stores';
  import {fade} from 'svelte/transition'

	export let data: StationData;
  let large = false;
</script>

<div class="station-container">
	<span on:click={() => ($currentStation = undefined)}>X</span>
	<h1>{stationNames[$currentStation]}</h1>
	<div class="charts">
		{#each Object.entries(data) as [componentKey, componentValue]}
			{#if componentValue.hmw.length > 0 && !componentKey.startsWith('WI')}
				<div class="chart-container" class:large>
          <div on:click={()=>large=!large} style="transform:rotate(180deg)">☌</div>
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
		position: absolute;
		bottom: 0;
		padding: 0 5%;
    box-sizing:border-box;
		width: 100%;
		background: var(--dark-gray);
		color: var(--yellow);
	}

	.charts {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5em;
	}

	.chart-container {
		padding-top: 0.5em;
	}

  .large {
    grid-column: 1 / span 2;


  }
</style>
