<script lang="ts">
	import * as THREE from 'three';
	import * as SC from 'svelte-cubed';
	import Particles from '$lib/particles/index.svelte';
	import Linz from '$lib/linz.svelte';
	import {positions} from '$lib/luftibois'

	let spawnRate = 0;

	//let color = new THREE.Color('red');
	//THREE.Color

	let h, s, l;
	

	$:color = new THREE.Color(`hsl(${h}, ${s}%, ${l}%)`);
	$:console.log($positions);
	SC.onFrame(() => {

	});
</script>

<SC.Canvas antialias background={new THREE.Color('thistle')} fog={new THREE.FogExp2('ivory', 0.005)}>
	<Particles particleSpriteTexPath='./textures/swirly.png' position={$positions.S184}/>
	<Particles position={$positions.S184} reverseTime={false}/>
	<Particles position={$positions.S415}/>
	<Particles position={$positions.S416}/>
	<Particles position={$positions.S431}/>
	
	<SC.PerspectiveCamera position={[0, 1, 2]} />
	<SC.OrbitControls enableZoom={true} />
	<SC.AmbientLight intensity={0.3} />
	<SC.PointLight intensity={5.3} position={[0,0.5,0]}/>
	<SC.DirectionalLight intensity={8.6} position={[0.3, 2.1, 0.5]}/>
	<Linz position={[0,0,0]}/>
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
