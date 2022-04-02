<script lang="ts">
	import { getHighestAlarmColor } from '$lib/utils';
	import { stationNames } from '$lib/constants';
	import { currentStation } from '$lib/stores';

	export let stationKey: string, stationValues: StationData;
</script>

<div class="container" on:click={() => ($currentStation = stationKey)}>
	<h2 >{stationNames[stationKey]}</h2>
	<div id="alarm" style={`background-color: ${getHighestAlarmColor(stationValues)}`} />
</div>

<style>

h2{
	color:var(--yellow);
}
	.container {
		display: flex;
		gap: 1em;
		border: solid 0.1em #c2c2c2;
		border-radius: 0.2em;
		padding:0.2em;
	}
	#alarm {
		width: 1.5em;
		height: 1.5em;
		border-radius: 100%;
	}
</style>
