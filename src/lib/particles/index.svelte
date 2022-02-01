<script lang="ts">
	import * as THREE from 'three';

	import * as SC from 'svelte-cubed';
	import type {Vec3} from './types'
	import { onMount } from 'svelte';

	import GPUParticleSystem from './GPUParticleSystem';

	let particleSystem, clock;
	let invalidate = SC.getInvalidator();

	export let maxParticles = 600,
		position:Vec3 = [0, 0, 0],
		spawnRate = 50,
		timeScale = 1.0,
		reverseTime = false,
		positionRandomness = 0.0,
		baseVelocity:Vec3= [0.0, 0.1, 0],
		particleSpriteTexPath = './textures/particle2.png',
		velocityRandomness = 0.2,
		acceleration:Vec3 = [0, 0, 0],
		baseColor = new THREE.Color(1.0, 0.0, 0.0),
		endColor = new THREE.Color(0.5, 1.0, 1.0),
		colorRandomness = 0.0,
		lifetime = 3,
		size = 10,
		sizeRandomness = 1.0,
		blending = THREE.AdditiveBlending;

	let velocity:Vec3 = [0.0, 0.0, 0],
		color = new THREE.Color(1.0, 0, 0);

	$: options = {
		maxParticles,
		spawnRate,
		timeScale,
		reverseTime,
		position,
		positionRandomness,
		baseVelocity,
		particleSpriteTex: undefined,
		velocity,
		velocityRandomness,
		acceleration,
		baseColor,
		color,
		endColor,
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
		//console.log(spawnRate%100)
		//console.log(options.spawnRate);
		if (delta > 0) {
			//spawn the correct number of particles for this frame based on the spawn rate
			for (let x = 0; x < options.spawnRate * delta; x++) {
				options.velocity[0] =
					options.baseVelocity[0] + particleSystem.random() * options.velocityRandomness;
				options.velocity[1] =
					options.baseVelocity[1] + particleSystem.random() * options.velocityRandomness;
				options.velocity[2] =
					options.baseVelocity[2] + particleSystem.random() * options.velocityRandomness;
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
		invalidate();
	});
</script>

{#if particleSystem}
	<SC.Primitive object={particleSystem} />
{/if}
