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
	import UI from '$lib/ui/index.svelte';
	import Map from '$lib/map.svelte';

	export let data: AirData;
</script>

<div class="container">
	<UI {data}/>
	<Map {data} />
</div>

<style>
	.container {
		position: relative;
		height: 100vh;
		margin: 0;
		padding: 0;
	}
</style>
