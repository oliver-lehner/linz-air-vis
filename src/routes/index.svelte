<script lang="ts">
	import * as THREE from 'three';
	import * as SC from 'svelte-cubed';
	import Particles from '$lib/particles/index.svelte';

	$: spawnRate = 500;

	SC.onFrame(()=>{
		spawnRate += 1;
		if (spawnRate > 10000) spawnRate=500;
	})

</script>

<SC.Canvas antialias background={new THREE.Color('palevioletred')}>
	<Particles 
		 position={new THREE.Vector3(0,0,0)}  {spawnRate}/>
	<SC.PerspectiveCamera position={[1, 1, 1]} />
	<SC.OrbitControls enableZoom={true} />
	<SC.AmbientLight intensity={0.6} />
	<SC.DirectionalLight intensity={0.6} position={[-2, 3, 2]} />
</SC.Canvas>
