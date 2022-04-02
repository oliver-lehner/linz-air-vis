<script lang="ts">
	import {
		Canvas,
		PerspectiveCamera,
		OrbitControls,
		DirectionalLight,
		PointLight,
		SpotLight,
		Mesh,
		GLTF,
		HemisphereLight
	} from 'threlte';

	import Particles from '$lib/particles/index.svelte';

	import {
		MeshStandardMaterial,
		MeshBasicMaterial,
		Color,
		BoxBufferGeometry,
		BackSide, Vector3
	} from 'three';

	import {
		getLuftiPositions,
		vectorFromDegreesAndVelocity,
		boxGeometryFromBoundingBox,
		getLatest,
		calcSeverity
	} from '$lib/utils';

	import { currentStation, camPos, poi } from '$lib/stores';

	import { componentColors } from '$lib/constants';

	//import { onDestroy, onMount } from 'svelte';
	import { spring } from 'svelte/motion';

	export let data: AirData;
	/* 	const clock = new Clock();

	let handle;
	const tick = () => {
		mixer.update(clock.getDelta());
		handle = requestAnimationFrame(tick);
	};
	onDestroy(() => {
		if (handle) cancelAnimationFrame(handle);
	}); */

	let map: GLTF; //, animations: AnimationClip[], mixer: AnimationMixer;
	let stationGeometry: LuftiData = <LuftiData>{};



	$: setCamera($currentStation);

	const particleAppearance = {
		PM10: { color: new Color(componentColors.PM10), size: 40 },
		PM25: { color: new Color(componentColors.PM25), size: 30 },
		SO2: { color: new Color(componentColors.SO2), size: 20 },
		NO2: { color: new Color(componentColors.NO2), size: 20 },
		O3: { color: new Color(componentColors.O3), size:20 }
	};

	function handleModelLoad(e) {
		const model = e.detail;
		stationGeometry = getLuftiPositions(model);
		map = model;
		//mixer = new AnimationMixer(model.scene);
		//tick();
	}

	function setCamera(station) {
		if (station) {
			let pos = stationGeometry[station]?.position;
			if (pos) {
				$poi = pos;
				$camPos = { x: pos.x + 2, y: pos.y + 2, z: pos.z + 2 };
			}
		} else {
			$camPos = { x: 0, y: 10, z: 0 };
			$poi = { x: 0, y:0, z:0 };
		}
	}

	
</script>


	<Canvas>
		<GLTF url={'./lufti_scene.glb'} on:load={handleModelLoad} />
		<!---bind:animations /--->

		{#if Object.keys(stationGeometry).length > 0}
			{#each Object.entries(stationGeometry) as [key, value]}
				<Mesh
					geometry={boxGeometryFromBoundingBox(value.boundingBox)}
					material={new MeshStandardMaterial({ color: 'red' })}
					position={value.position}
					scale={value.scale}
					rotation={value.rotation}
					visible={false}
					interactive={true}
					on:pointerdown={() => {
						/* animations.forEach(function (clip) {
							console.log(clip.name);
							mixer.clipAction(clip).play();
						}); */
						$currentStation = key;
					}}
				/>
				{#each Object.entries(data[key]) as [componentKey, componentValue], index}
					{#if componentKey != 'WIV' && componentKey != 'WIR' && componentValue.hmw.length > 0}
						<Particles
							endColor={particleAppearance[componentKey].color}
							baseColor={particleAppearance[componentKey].color}
							size={particleAppearance[componentKey].size}
							maxParticles={50000}
							fadeOut={1}
              fadeIn={1}
							reverseTime={true}
							particleSpriteTexPath="./textures/rhcp.png"
							positionRandomness={0.5}
							velocityRandomness={0.1}
							position={{
								x: value.position.x,
								y: value.position.y + index * 0.1,
								z: value.position.z
							}}
							baseVelocity={vectorFromDegreesAndVelocity(
								270 + getLatest(data[key]['WIR'].hmw).value,
								getLatest(data[key]['WIV'].hmw).value,
								0.2
							)}
							spawnRate={calcSeverity(componentKey, getLatest(componentValue.hmw).value)}
							
						/>
					{/if}
				{/each}
			{/each}
			<!-- 									
			vectorFromDegreesAndVelocity(
								90 + getLatest(data[key]['WIR'].hmw).value,
								getLatest(data[key]['WIV'].hmw).value
								calcSeverity('PM25', getLatest(data['S415']['PM25'].hmw).value)
							)--->
			
<!-- 			<Particles

							baseColor={particleAppearance['PM25'].color}
							size={particleAppearance['PM25'].size}
							maxParticles={1000}
							particleSpriteTexPath="./textures/rhcp.png"
							position={{
								x: stationGeometry.S415.position.x,
								y: stationGeometry.S415.position.y + 0.1,
								z: stationGeometry.S415.position.z
							}}
							baseVelocity={new Vector3(0.1,0,0)}
							spawnRate={10}
						/> --> 
		{/if}

		<PerspectiveCamera position={$camPos} lookAt={$poi} />
		{#if $currentStation}
			<SpotLight
				position={{ x: $poi.x + 0.4, y: $poi.y + 1, z: $poi.z + 0.4 }}
				target={$poi}
				penumbra={0.6}
				angle={0.5}
			/>
			<SpotLight
				position={{ x: $poi.x, y: $poi.y + 1, z: $poi.z }}
				target={$poi}
				penumbra={0.4}
				angle={0.3}
			/>
			<SpotLight
				position={{ x: $poi.x - 0.1, y: $poi.y + 0.7, z: $poi.z + 0.5 }}
				target={$poi}
				penumbra={0.8}
				angle={0.8}
			/>
		{:else}{/if}
		<DirectionalLight />
		<HemisphereLight skyColor={'white'} groundColor={'#ac844c'} intensity={0.5} />
	</Canvas>



