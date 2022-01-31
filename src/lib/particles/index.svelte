<script lang="ts">
	import * as THREE from 'three';

	import * as SC from 'svelte-cubed';
	import { onMount } from 'svelte';

	import GPUParticleSystem from './GPUParticleSystem';
import { MathUtils } from 'three';

	let particleSystem, clock;

	let spin = 0;

	export let maxParticles = 100000,
		spawnRate = 5000,
		timeScale = 1.0,
		position = new THREE.Vector3(0, 0, 0),
		positionRandomness = 0.0,
		baseVelocity = new THREE.Vector3(0.0, 0.0, 0),
		velocity = new THREE.Vector3(0.0, 0.0, 0.0),
		particleSpriteTexPath = './textures/particle2.png',
		velocityRandomness = 0.5,
		acceleration = new THREE.Vector3(0, 0, 0),
		baseColor = new THREE.Color(1.0, 1.0, 0.5),
		color = new THREE.Color(1.0, 0, 0),
		colorRandomness = 0.5,
		lifetime = 3,
		size = 10,
		sizeRandomness = 1.0,
		blending = THREE.AdditiveBlending;

	let options = {
		maxParticles,
		spawnRate,
		timeScale,
		position,
		positionRandomness,
		baseVelocity,
		particleSpriteTex:undefined,
		velocity,
		velocityRandomness,
		acceleration,
		baseColor,
		color,
		colorRandomness,
		lifetime,
		size,
		sizeRandomness,
		blending
	};

	onMount(() => {
		const textureLoader = new THREE.TextureLoader();
		options.particleSpriteTex = textureLoader.load(particleSpriteTexPath);
		particleSystem = new GPUParticleSystem(options);
		clock = new THREE.Clock();
	});

	SC.onFrame(() => {
		const delta = clock.getDelta() * options.timeScale;
		options.spawnRate = spawnRate;
		//console.log(spawnRate%100)
		if(spawnRate%100 == 0) options.color = new THREE.Color(MathUtils.randFloat(0,1), MathUtils.randFloat(0,1), MathUtils.randFloat(0,1))
		//console.log(options.spawnRate);
		spin += 0.01;
		if (delta > 0) {
			//spawn the correct number of particles for this frame based on the spawn rate
			for (let x = 0; x < options.spawnRate * delta; x++) {
				options.velocity.x =
					options.baseVelocity.x + particleSystem.random() * options.velocityRandomness;
				options.velocity.y =
					options.baseVelocity.y + particleSystem.random() * options.velocityRandomness;
				options.velocity.z =
					options.baseVelocity.z + particleSystem.random() * options.velocityRandomness;
				options.color.setRGB(
					THREE.MathUtils.clamp(
						options.baseColor.r + particleSystem.random() * options.colorRandomness,
						0,
						1
					),
					THREE.MathUtils.clamp(
						options.baseColor.g + particleSystem.random() * options.colorRandomness,
						0,
						1
					),
					THREE.MathUtils.clamp(
						options.baseColor.b + particleSystem.random() * options.colorRandomness,
						0,
						1
					)
				);
				particleSystem.spawnParticle(options);
			}
		}
		//original code used the render function's time
		//not sure if i'm doing this right
		particleSystem.update(clock.getElapsedTime());
	});
</script>

{#if particleSystem}
	<SC.Primitive object={particleSystem} scale={[10, 10, 10]} rotation={[spin, spin, spin]} />
{/if}
