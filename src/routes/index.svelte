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

	import {
		getLuftiPositions,
		boxGeometryFromBoundingBox,
		vectorFromDegreesAndVelocity
	} from '$lib/utils';
	import Particles from '$lib/particles/index.svelte';

	import { MeshStandardMaterial, Box3, BoxBufferGeometry, Vector3, MathUtils, Color } from 'three';
	import { spring } from 'svelte/motion';
	import Dashboard from '$lib/dashboard.svelte';

	export let data: AirData;

	let map: GLTF;
	let stationGeometry: LuftiData = <LuftiData>{};

	const poi = spring({ x: 0, y: 0, z: 0 }, { stiffness: 0.4, damping: 0.6 });
	const camPos = spring({ x: 0, y: 2, z: 5 });
	const particleColors = {
		PM10kont: new Color(0, 255, 0),
		PM25kont: new Color(0, 200, 200),
		SO2: new Color(255, 0, 0),
		NO2: new Color(200, 0, 200),
		O3: new Color(200, 100, 100)
	};

	function handleModelLoad(e) {
		const model = e.detail;
		stationGeometry = getLuftiPositions(model);
		map = model;
	}
</script>

<div class="container">
	<Dashboard {data} />
	<Canvas>
		<GLTF url={'./lufti_scene.glb'} on:load={handleModelLoad} />

		{#if Object.keys(stationGeometry).length > 0}
			{#each Object.entries(stationGeometry) as [key, value]}
				<Mesh
					geometry={boxGeometryFromBoundingBox(value.boundingBox)}
					material={new MeshStandardMaterial({ color: '#ff3e00' })}
					position={value.position}
					scale={value.scale}
					rotation={value.rotation}
					visible={false}
					interactive={true}
					on:pointerdown={() => {
						let index = map.scene.children.findIndex((val) => val.name == key);
						let stationPosition = map.scene.children[index].position;
						poi.set(stationPosition);
						camPos.set({
							x: stationPosition.x,
							y: stationPosition.y + 0.2,
							z: stationPosition.z + 0.4
						});
					}}
				/>
				{#each Object.entries(data[key]) as [componentKey, componentValue], index}
					{#if componentKey != 'WIV' && componentKey != 'WIR' && componentValue.hmw.length > 0}
						{console.log(componentValue.hmw[0].value)}
						<Particles
							baseColor={particleColors[componentKey]}
							endColor={particleColors[componentKey]}
							particleSpriteTexPath="./textures/swirly.png"
							position={{
								x: value.position.x,
								y: value.position.y + index * 0.02,
								z: value.position.z
							}}
							baseVelocity={vectorFromDegreesAndVelocity(
								data[key]['WIR'].hmw[0].value,
								data[key]['WIV'].hmw[0].value
							)}
							spawnRate={componentValue.hmw[0].value}
						/>
					{/if}
				{/each}
			{/each}
		{/if}

		<PerspectiveCamera position={$camPos} lookAt={$poi}>
			<OrbitControls />
		</PerspectiveCamera>

		<DirectionalLight shadow color={'white'} position={{ x: -15, y: 45, z: 20 }} />
		<HemisphereLight skyColor={'white'} groundColor={'#ac844c'} intensity={0.4} />
	</Canvas>
</div>

<style>
	.container {
		height: 100vh;
		margin: 0;
		padding: 0;
	}
</style>
