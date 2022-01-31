<script lang="ts">
	import * as THREE from 'three';
	import * as SC from 'svelte-cubed';
	import Particles from '$lib/particles/index.svelte';

	const spawnerOptions = {
            spawnRate: 5000, // create at the rate of 500 particles/sec
            timeScale: 1.0
        };

</script>

<SC.Canvas antialias background={new THREE.Color('palevioletred')}>
	<Particles 
		 position={new THREE.Vector3(0,0,0)} {spawnerOptions}/>
	<SC.PerspectiveCamera position={[1, 1, 1]} />
	<SC.OrbitControls enableZoom={true} />
	<SC.AmbientLight intensity={0.6} />
	<SC.DirectionalLight intensity={0.6} position={[-2, 3, 2]} />
</SC.Canvas>
