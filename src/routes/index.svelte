<script lang="ts">
	import * as THREE from 'three';
	import * as SC from 'svelte-cubed';
	import Particles from '$lib/particles/index.svelte';

	let spawnRate = 0;

	//let color = new THREE.Color('red');
	//THREE.Color

	let h, s, l;
	

	$:color = new THREE.Color(`hsl(${h}, ${s}%, ${l}%)`);
	$:console.log(color);
	SC.onFrame(() => {

	});
</script>

<SC.Canvas antialias background={new THREE.Color('black')}>
	<Particles position={[0.5, 0.3, 1]} baseColor={color} endColor={new THREE.Color(1, 0, 0)} />
	<Particles
		reverseTime={true}
		position={[1.5, 0.3, 1]}
		baseColor={color}
		endColor={new THREE.Color(0, 1, 0)}
	/>
	<Particles
		{spawnRate}
		lifetime={3}
		maxParticles={20000}
		position={[0.5, 1.3, 1]}
		baseColor={color}
		endColor={new THREE.Color(0, 0, 1)}
	/>
	<Particles position={[0.5, 0.3, 2]} baseColor={color} endColor={new THREE.Color(1, 1, 1)} />
	<SC.PerspectiveCamera position={[1, 1, 10]} />
	<SC.OrbitControls enableZoom={true} />
	<SC.AmbientLight intensity={0.6} />
	<SC.DirectionalLight intensity={0.6} position={[-2, 3, 2]} />
</SC.Canvas>
<div class="controls">
	<input type="range" min="0" max="1000" bind:value={spawnRate} id="spawn-rate" />
	<label for="spawn-rate">Spawn Rate</label>
		<input type="range" min="0" max="360" bind:value={h} id="hue" />
	<label for="spawn-rate">Hue</label>
		<input type="range" bind:value={s} id="saturation" />
	<label for="spawn-rate">Saturation</label>
		<input type="range" bind:value={l} id="lightness" />
	<label for="spawn-rate">Lightness</label>
</div>


<style>
	.controls {
		position: absolute;
	}
</style>
