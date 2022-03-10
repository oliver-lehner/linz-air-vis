<script lang="ts">
	import { extent, scaleLinear, mean, max as maximum } from 'd3';
	import { targets, componentColors, componentNames } from '$lib/constants';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	export let data: Measurement[], component: string;
	const values = Object.values(data).map((value) => value.value);

	const width = 400;
	const height = 300;
	export let large = false;
	$: large;

	const xStep = width / values.length;
	const aqg = targets[component]?.AQG;
	const max = maximum(values);

	const scale = scaleLinear()
		.domain([0, max > aqg ? max : aqg])
		.range([0, height]);

	const meanValue = scale(mean(values));
	const aqgScaled = scale(aqg);

	const getFormattedTime = (time: number): string => {
		return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};
</script>

<h3 on:click={() => (large = !large)}>{@html componentNames[component]}</h3>
<svg
	class="graph"
	viewBox={`0 0 ${width} ${height}`}
	version="1.1"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	xmlns="http://www.w3.org/2000/svg"
>
	<g>
		<line x1="0" y1="0" x2="0" y2={height} stroke="white" />
		<line x1="0" y1={height} x2={width} y2={height} stroke="white" />
		{#if large}
			<text class="label-right" x="0" y={height}>0</text>
			<text class="label-right" x="0" y={height - aqgScaled}>{aqg}</text>
			<text class="label-right" x="0" y={height - scale(max)}>{max.toFixed(1)}</text>
			<text class="label-center hanging" x={0} y={height}>{getFormattedTime(data[0].time)}</text>
			<text class="label-center hanging" x={width} y={height}
				>{getFormattedTime(data[data.length - 1].time)}</text
			>
		{/if}
	</g>
	<g>
		<polyline
			points={Object.entries(values)
				.map((value) => parseInt(value[0]) * xStep + ',' + (height - scale(value[1])))
				.reduce((prev, current) => prev + ' ' + current)}
			fill="none"
			stroke="currentColor"
		/>
		{#each values as value, index}
			<circle
				cx={xStep * index}
				cy={height - scale(value)}
				data-value={value}
				data-scaled-value={scale(value)}
				r="3"
				fill={componentColors[component]}
			/>
		{/each}
		<line
			x1="0"
			y1={height - meanValue}
			x2={width}
			y2={height - meanValue}
			stroke="white"
			stroke-dasharray="1 4"
		/>
		<line x1="0" y1={height - aqgScaled} x2={width} y2={height - aqgScaled} stroke="var(--green)" />
	</g>
</svg>

<style>
	svg {
		max-height: 80%;
	}

	.label-right {
		text-anchor: end;
		dominant-baseline: middle;
	}

	.label-center {
		text-anchor: middle;
	}

	.hanging {
		dominant-baseline: hanging;
	}
</style>
