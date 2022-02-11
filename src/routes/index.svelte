<script lang="ts">
	import * as THREE from 'three';

	import {
		Canvas,
		PerspectiveCamera,
		OrbitControls,
		DirectionalLight,
		HemisphereLight,
		Mesh,
		GLTF,
		Position,
		Rotation
	} from 'threlte';

	import Particles from '$lib/particles/index.svelte';

	import { MeshStandardMaterial, Box3, BoxBufferGeometry, Vector3} from 'three';
	import {spring} from 'svelte/motion';

	interface LuftiData {
		[key: string]: { position: Position; boundingBox: Box3; scale: Vector3; rotation: Rotation };
	}

	let data: LuftiData = <LuftiData>{};
	let map;
	const poi = spring({x:0, y:0, z:0}, {stiffness: 0.4, damping:0.6});
	const camPos =  spring({ x: 0, y: 2, z: 5 });

	let loaded = false;
	let spawnRate = 0;

	let h, s, l;

	function getLuftiPositions(e) {
		const model: GLTF = e.detail;
		console.log(model);
		model.scene.children
			.filter((obj) => obj.name.startsWith('S'))
			.forEach((obj) => {
				data[obj.name] = {
					position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
					boundingBox: { ...obj.geometry.boundingBox },
					scale: { ...obj.scale },
					rotation: { x: obj.rotation._x, y: obj.rotation._y, z: obj.rotation._z }
				};
			});
		console.log(data);
		loaded = true;
		map = model;
	}

	function boxFromLufti(name: string): BoxBufferGeometry {
	console.log(name)
		const boundingBox = data[name].boundingBox;
		// make a BoxBufferGeometry of the same size as Box3
		const dimensions = new THREE.Vector3().subVectors(boundingBox.max, boundingBox.min);
		const boxGeo = new THREE.BoxBufferGeometry(dimensions.x, dimensions.y, dimensions.z);

		// move new mesh center so it's aligned with the original object
		const matrix = new THREE.Matrix4().setPosition(
			dimensions.addVectors(boundingBox.min, boundingBox.max).multiplyScalar(0.5)
		);
		boxGeo.applyMatrix4(matrix);
		return boxGeo;
	}

	$: color = new THREE.Color(`hsl(${h}, ${s}%, ${l}%)`);
</script>

<div class="container">
	<Canvas>
		<GLTF castShadow receiveShadow url={'./lufti_scene.glb'} on:load={getLuftiPositions} />

		{#if loaded}
			{#each Object.entries(data) as [key, value]}
				<Particles particleSpriteTexPath="./textures/swirly.png" position={value.position} />
				<Mesh
					geometry={boxFromLufti(key)}
					material={new MeshStandardMaterial({ color: '#ff3e00' })}
					position={value.position}
					scale={value.scale}
					rotation={value.rotation}
					visible={false}
					interactive={true}
					on:pointerdown={() => {
						let index = map.scene.children.findIndex((val)=>val.name == key)
						poi.set(map.scene.children[index].position);
						camPos.set({x:0, y: 3, z: 0})
						console.log(poi);
					}}
				/>
			{/each}
		{/if}

		<PerspectiveCamera position={$camPos} lookAt={$poi}>
			<OrbitControls />
		</PerspectiveCamera>

		<DirectionalLight shadow color={'white'} position={{ x: -15, y: 45, z: 20 }} />
		<HemisphereLight skyColor={'white'} groundColor={'#ac844c'} intensity={0.4} />

		<!--     <Mesh
      castShadow
      geometry={new THREE.BoxBufferGeometry(1, 1, 1)}
      material={new THREE.MeshStandardMaterial({ color: '#ff3e00' })}
    /> -->

		<!--     <Mesh
      receiveShadow
      position={{ y: -0.5 }}
      rotation={{ x: -90 * (Math.PI / 180) }}
      geometry={new THREE.CircleBufferGeometry(3, 72)}
      material={new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, color: 'white' })}
    /> -->
	</Canvas>
</div>
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

	.container {
		height: 100vh;
		position: relative;
	}
</style>
