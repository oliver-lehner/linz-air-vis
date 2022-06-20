<script lang="ts">
	import { extent, scaleLinear, mean, max as maximum } from 'd3';
	import { targets, componentColors, componentNames } from '$lib/constants';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import {onMount} from 'svelte';

	export let data: Measurement[], component: string;
	const values = Object.values(data).map((value) => value.value);

	const width = 600;
	const height = 300;
	const margin = 80;
	const textPadding = 10;

	const xStep = width / values.length;
	const aqg = targets[component]?.AQG;
	const max = maximum(values);

	const scale = scaleLinear()
		.domain([0, max > aqg ? max : aqg])
		.range([0, height]);

	const meanValue = scale(mean(values));
	const aqgScaled = scale(aqg);
	let labelOffset = 0;
	onMount(()=>{labelOffset = getLabelOffset(meanValue,aqgScaled);})


	const getFormattedTime = (time: number): string => {
		return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	function getLabelOffset(mean: number, aqg: number): number{
		const fontSizePx = parseFloat(getComputedStyle(document.getElementById('labels')).fontSize);
		if (Math.abs(mean - aqg) < fontSizePx)
			if (mean >= aqg) {
				return fontSizePx / 2;
			} else {
				return -fontSizePx / 2;
			}
		return 0;
	};
</script>

<h3>{@html componentNames[component]}</h3>
<svg
	class="graph"
	viewBox={`${-margin / 2} ${-margin / 2} ${width + margin} ${height + margin}`}
	version="1.1"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	xmlns="http://www.w3.org/2000/svg"
>
	<g id="labels" fill="currentColor">
		<text class="label-right" x={-textPadding} y={height}>0</text>
		<text
			class="label-left aqg"
			x={width + textPadding}
			y={height - aqgScaled + labelOffset}
			fill="currentColor">AQG</text
		>
		<text
			class="label-left"
			x={width + textPadding}
			y={height - meanValue - labelOffset}
			fill="currentColor">MW</text
		>
		<text class="label-right" x={-textPadding} y={height - scale(max)}>{max.toFixed(1)}</text>

		<text class="label-center hanging" x={0} y={height + textPadding}
			>{getFormattedTime(data[0].time)}</text
		>
		<text
			class="label-center hanging"
			x={parseInt('' + data.length / 2) * xStep}
			y={height + textPadding}>{getFormattedTime(data[parseInt('' + data.length / 2)].time)}</text
		>
		<text class="label-center hanging" x={(data.length - 1) * xStep} y={height + textPadding}
			>{getFormattedTime(data[data.length - 1].time)}</text
		>
	</g>
	<g>
		<g id="axes">
			<line x1="0" y1={-margin / 3} x2="0" y2={height} stroke="white" />
			<line x1="0" y1={height} x2={width + margin / 3} y2={height} stroke="white" />
		</g>
		<polyline
			points={Object.entries(values)
				.map((value) => parseInt(value[0]) * xStep + ',' + (height - scale(value[1])))
				.reduce((prev, current) => prev + ' ' + current)}
			fill="none"
			stroke="currentColor"
		/>
		{#each values as value, index}
			<line
				x1={xStep * index}
				y1={height - textPadding / 2}
				x2={xStep * index}
				y2={height + textPadding / 2}
				stroke="white"
			/>
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
		<line
			class="aqg"
			x1="0"
			y1={height - aqgScaled}
			x2={width}
			y2={height - aqgScaled}
			stroke="currentColor"
		/>
	</g>
</svg>

<style>
	svg {
		width: 100%;
	}

	text {
		font-size: 1.4em;
	}

	.label-right {
		text-anchor: end;
		dominant-baseline: middle;
	}

	.label-left {
		dominant-baseline: middle;
	}

	.label-center {
		text-anchor: middle;
	}

	.aqg {
		color: var(--green);
	}

	.hanging {
		dominant-baseline: hanging;
	}
</style>
