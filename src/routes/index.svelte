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
	import {
		Canvas,
		PerspectiveCamera,
		OrbitControls,
		DirectionalLight,
		PointLight,
		Mesh,
		GLTF,
		useFrame,
		useThrelte,
		HemisphereLight,
		Fog,
		FogExp2
	} from 'threlte';

	import Particles from '$lib/particles/index.svelte';

	import {
		MeshStandardMaterial,
		Color,
		AnimationClip,
		AnimationMixer,
		Clock,
		TextureLoader
	} from 'three';
	import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

	import Dashboard from '$lib/dashboard.svelte';
	import {
		getLuftiPositions,
		vectorFromDegreesAndVelocity,
		boxGeometryFromBoundingBox,
		getLatest,
		calcSeverity,
		setCamera
	} from '$lib/utils';

	import { camPos, poi } from '$lib/stores';

	import { componentColors } from '$lib/constants';
	import { onDestroy, onMount } from 'svelte';

	export let data: AirData;
	const clock = new Clock();

	let handle;
	const tick = () => {
		mixer.update(clock.getDelta());
		handle = requestAnimationFrame(tick);
	};
	onDestroy(() => {
		if (handle) cancelAnimationFrame(handle);
	});

	let map: GLTF, animations: AnimationClip[], mixer: AnimationMixer;
	let stationGeometry: LuftiData = <LuftiData>{};

	/* 	
	VR!?
	const { renderer,scene,camera } = useThrelte();
	document.body.appendChild( VRButton.createButton( renderer ) );
	renderer.xr.enabled = true;

	renderer.setAnimationLoop(()=>{renderer.render(scene,$camera)}) 
	*/

	const particleAppearance = {
		PM10: { color: new Color(componentColors.PM10), size: 100 },
		PM25: { color: new Color(componentColors.PM25), size: 25 },
		SO2: { color: new Color(componentColors.SO2), size: 15 },
		NO2: { color: new Color(componentColors.NO2), size: 15 },
		O3: { color: new Color(componentColors.O3), size: 15 }
	};

	function handleModelLoad(e) {
		const model = e.detail;
		stationGeometry = getLuftiPositions(model);
		map = model;
		mixer = new AnimationMixer(model.scene);
		//tick();
	}
</script>

<div class="container">
	<Dashboard {data} data3D={stationGeometry} />
	<Canvas>
		<GLTF url={'./lufti_scene.glb'} on:load={handleModelLoad} bind:animations />

		{#if Object.keys(stationGeometry).length > 0}
<!-- 			{#each Object.entries(stationGeometry) as [key, value]}
				<Mesh
					geometry={boxGeometryFromBoundingBox(value.boundingBox)}
					material={new MeshStandardMaterial({ color: 'transparent' })}
					position={value.position}
					scale={value.scale}
					rotation={value.rotation}
					visible={false}
					interactive={true}
					on:pointerdown={() => {
						console.log();
						animations.forEach(function (clip) {
							console.log(clip.name);
							mixer.clipAction(clip).play();
						});
						setCamera(value.position);
					}}
				/>
				<PointLight
					intensity={0.3}
					position={{ x: value.position.x, y: value.position.y - 0.1, z: value.position.z }}
					color={'white'}
				/>
				{#each Object.entries(data[key]) as [componentKey, componentValue], index}
					{#if componentKey != 'WIV' && componentKey != 'WIR' && componentValue.hmw.length > 0}
						<Particles
							baseColor={particleAppearance[componentKey].color}
							size={particleAppearance[componentKey].size}
							maxParticles={calcSeverity(componentKey, getLatest(componentValue.hmw).value)}
							particleSpriteTexPath="./textures/swirly.png"
							position={{
								x: value.position.x,
								y: value.position.y + index * 0.1,
								z: value.position.z
							}}
							baseVelocity={vectorFromDegreesAndVelocity(
								getLatest(data[key]['WIR'].hmw).value,
								getLatest(data[key]['WIV'].hmw).value
							)}
							spawnRate={0.000000001}
						/>
					{/if}

				{/each}
				
			{/each} -->
									<Particles
							baseColor={particleAppearance['PM25'].color}
							size={particleAppearance['PM25'].size}
							maxParticles={calcSeverity('PM25', getLatest(data['S415']['PM25'].hmw).value)}
							particleSpriteTexPath="./textures/swirly.png"
							position={{
								x: stationGeometry.S415.position.x,
								y: stationGeometry.S415.position.y + 0.1,
								z: stationGeometry.S415.position.z
							}}
							baseVelocity={vectorFromDegreesAndVelocity(
								getLatest(data['S415']['WIR'].hmw).value,
								getLatest(data['S415']['WIV'].hmw).value
							)}
							spawnRate={0.000000001}
						/>
		{/if}

		<PerspectiveCamera position={$camPos} lookAt={$poi}>
			<OrbitControls />
		</PerspectiveCamera>

		<DirectionalLight intensity={0.4} color={'white'} position={{ x: -5, y: 5, z: -5 }} />
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
