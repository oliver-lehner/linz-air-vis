<script context="module">
	export const load = async ({ fetch }) => {
		try {
			const response = await fetch('air-data.json', {
				method: 'GET',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			return {
				props: { ...(await response.json()) }
			};
		} catch (error) {
			console.error(`Error in load function for /: ${error}`);
			return error;
		}
	};
</script>

<script lang="ts">
	import Dashboard from '$lib/dashboard.svelte';
	import Map from '$lib/map.svelte';
	import StationDetail from '$lib/StationDetail/index.svelte';
	import { currentStation } from '$lib/stores';

	export let data: AirData;
</script>

<div class="container">
	<Dashboard {data} />
	<Map {data}/>
	{#if $currentStation}
		<StationDetail data = {data[$currentStation]} />
	{/if}
</div>

<style>
	.container {
		position: relative;
		height: 100vh;
		margin: 0;
		padding: 0;
	}
</style>
