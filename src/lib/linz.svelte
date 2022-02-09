<script lang="ts">
	import * as THREE from 'three';
	import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

	import * as SC from 'svelte-cubed';
	import { onMount } from 'svelte';
	import { positions } from '$lib/luftibois';

	export let position: SC.Position;

	function loadGLTFModel() {
		const loader = new GLTFLoader();
		return loader.loadAsync('./lufti_scene.glb');
	}

	let model: GLTF;

	onMount(() => {
		loadGLTFModel().then((modelData) => {
			model = modelData;
			const filter = model.scene.children
				.filter((obj) => obj.name.startsWith('S'))
				.forEach(
					(obj) => ($positions[obj.name] = [obj.position.x, obj.position.y, obj.position.z])
				);
			console.log($positions);
		});
	});
</script>

{#if model}
	<SC.Primitive object={model.scene} scale={[1, 1, 1]} {position} />
{/if}
