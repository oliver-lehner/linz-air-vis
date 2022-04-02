<script lang="ts">
	import { componentColors, componentNames } from '$lib/constants';
	import { getLatest, getAlarmColor } from '$lib/utils';

	export let componentKey: string, componentValues;

	const latestValue = getLatest(componentValues.hmw).value;
</script>

<div id="container" style={`background-color: ${componentColors[componentKey]}`}>
	<p>{@html componentNames[componentKey]}</p>
	<div id="strip" style={`background-color: ${getAlarmColor(componentKey, latestValue)}`} />
	<p>
		{latestValue.toFixed(1)}
	</p>
</div>

<style>
	p {
		color: var(--yellow);
		font-size: 0.6em;
		white-space: nowrap;
		text-align: center;
		line-height: 1.5;

	}

	#container {
		display: grid;
    grid-template-rows: 3fr 2fr 3fr;
		border-radius: 0.1em;
	}

	#strip {
		width: 100%;
	}
</style>
