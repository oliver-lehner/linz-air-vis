<script lang="ts">
	import Linechart from './linechart.svelte';
	import { stationNames } from '$lib/constants';
	import { currentStation } from '$lib/stores';
	import { fade } from 'svelte/transition';
	import Compass from '$lib/compass.svelte';
	import { getLatest } from '$lib/utils';

	export let data: StationData;

	const countComponents = (data: StationData) => {
		return Object.entries(data).filter((component) => {
			console.log('COMP: ', component);
			return !component[0].startsWith('WI') && component[1].hmw.length > 0;
		}).length;
	};

	console.log('COUNT: ', countComponents(data));

	let large = new Array<boolean>(countComponents(data)).fill(false);
</script>

<div class="station-container">
	<div class="header">
		<h1>{stationNames[$currentStation]}</h1>
		<Compass orientation={getLatest(data.WIR.hmw).value} speed={getLatest(data.WIV.hmw).value} />
		<div class="close" on:click={() => ($currentStation = undefined)}>X</div>
	</div>

	<div class="charts">
		{#each Object.entries(data) as [componentKey, componentValue], index}
			{#if componentValue.hmw.length > 0 && !componentKey.startsWith('WI')}
				{#key large}
					<div
						in:fade
						class="chart-container"
						class:large={large[index]}
						style:display={large.findIndex((value) => value == true) > -1 &&
						index != large.findIndex((value) => value == true)
							? 'none'
							: 'initial'}
						on:click={() => (large[index] = !large[index])}
					>
						{#key $currentStation}
							<Linechart component={componentKey} data={componentValue.hmw} large={large[index]} />
						{/key}
					</div>
				{/key}
			{/if}
		{/each}
	</div>
</div>

<style>
	.station-container {
		position: absolute;
		display:flex;
		flex-direction: column;
		bottom: 0;
		padding: 0 5%;
		box-sizing: border-box;
		width: 100%;
		height: 30vh;
		background-color: transparent;
		color: var(--yellow);
	}

	.header {
		display: flex;
		align-items: center;
		align-content: space-around;
		margin: 0.5em 0;
	}
	.close {
		align-self: flex-start;
	}
	.charts {
		display: flex;
		gap: 0.5em;
		width:100%;
		overflow-x: scroll;
		scroll-snap-type: x proximity;
	}

	.chart-container {
		background: var(--dark-gray);
		min-width:90vw;
		scroll-snap-align: start;
	}

	.large {
		grid-column: 1 / span 2;
	}
</style>
