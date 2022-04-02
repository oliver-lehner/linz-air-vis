<script lang="ts">
	import { currentStation } from '$lib/stores';
	import {fade} from 'svelte/transition'
	import StationButton from '$lib/ui/stationButton.svelte';
	import OverviewButton from '$lib/ui/overviewButton.svelte'
	import StationDetail from '$lib/ui/StationDetail/index.svelte';

	export let data: AirData;
</script>

	{#if data}
		<div id="station-button-container">
			{#each Object.entries(data) as [stationKey, stationValues]}
				<StationButton {stationKey} {stationValues} />
			{/each}
		</div>
		{#if $currentStation}
		<div id="station-detail-container" transition:fade>
			<OverviewButton/>
			<StationDetail data={data[$currentStation]} />
		</div>
		{/if}
	{/if}

<style>

#station-detail-container {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		bottom: 0;
		box-sizing: border-box;
		width: 100%;
}

	#station-button-container {
		position: absolute;
		margin: 1em 0 0 1em;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		width:fit-content;
	}

</style>
