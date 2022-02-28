<script lang="ts">
	import Compass from '$lib/compass.svelte';
  import {getLatest} from '$lib/utils';
	import {componentColors, stationNames} from '$lib/constants';
	import {currentStation} from '$lib/stores'

	export let data: AirData;

</script>

<div class="container">
	{#if data}
	{#each Object.entries(data) as [stationKey, stationValues]}
		<div class="cell">
			<h2 on:click={()=>$currentStation = stationKey}>{stationNames[stationKey]}</h2>
      <p></p>
			<div class="components">
				{#each Object.entries(stationValues) as [componentKey, componentValues]}
					{#if componentKey != 'WIR' && componentKey != 'WIV' && componentValues.hmw.length > 0}
						<div style={`background-color: ${componentColors[componentKey]}`}>
							<p>{componentKey}</p>
								<p>{getLatest(componentValues.hmw).value.toFixed(2)}</p>
						</div>
					{/if}
				{/each}
				<div class="compass-container">
					<Compass orientation={getLatest(stationValues.WIR.hmw).value} />
          <p>{((getLatest(stationValues.WIV.hmw).value)*3.6).toFixed(1)+' km/h'}</p>
				</div>
			</div>
		</div>
	{/each}
	{/if}
</div>

<style>
	.container {
		position: absolute;
		box-sizing: border-box;
		width:100%;
		padding: 0.5em;
		background: var(--dark-gray);
		border: 2px solid var(--green);
		display: grid;
		grid-template-columns: 50% 50%;
		gap: 0.5em;
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
		flex-direction: row;
		gap: 0.2em;
	}

	.components p {
		font-size: 0.6em;
		text-align: center;
	}

	.components > div {
		overflow: hidden;
		border-radius: 0.1em;
		padding: 0 0.2em;
	}

	.compass-container {
		display:flex;
		flex-direction: row;
		align-items: center;
		width:4em;
	}

	.compass-container > p {
		text-align: left;
		padding-left:0.5em;
	}
</style>
