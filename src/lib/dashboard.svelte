<script lang="ts">
	export let data: AirData;

	const stationNames = {
		S415: '24er-Turm',
		S416: 'Neue Welt',
		S431: 'Römerberg',
		S184: 'Stadtpark'
	};
</script>

<div class="container">
	{#each Object.entries(data) as [stationKey, stationValues]}
  <div class="cell">
		<h2>{stationNames[stationKey]}</h2>
    <div class="components">
    {#each Object.entries(stationValues) as [componentKey, componentValues]}
      {#if componentKey != 'WIR' && componentKey != 'WIV'}
      <div>
        <p>{componentKey}</p>
        {#if componentValues.hmw[0]}
        <p>{componentValues.hmw[0].value.toFixed(2)}</p>
        <p>{componentValues.unit}</p>
        {/if}
      </div>
      {/if}
    {/each}
    </div>
  </div>
	{/each}
</div>

<style>
	.container {
		position: absolute;
		width: 100%;
		background: var(--dark-gray);
    border: 2px solid var(--green);
		display: grid;
		grid-template-columns: 50% 50%;
	}

  .container h2, p {
    color: var(--yellow)
  }

	h2 {
		font-weight: 600;
    font-size: 1.2em;
	}

  .components {
    display:flex;
    flex-direction: row;
    gap: 0.2em;
  }

  .components p {
    font-size:0.6em;
    text-align: center;
  }

  .components > div {
    overflow: hidden;
  }
</style>
