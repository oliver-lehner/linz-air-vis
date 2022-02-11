<script lang="ts">
	//import * as THREE from 'three';
	import { Object3DInstance, Position } from 'threlte';
	import { onMount } from 'svelte';
	import { useFrame } from 'threlte';

	import GPUParticleSystem from './GPUParticleSystem';
	import { Clock, Color, MathUtils, NormalBlending, TextureLoader, Vector3 } from 'three';

	let particleSystem, clock;

	export let maxParticles = 600,
		position: Position = { x: 0, y: 0, z: 0 },
		spawnRate = 50,
		timeScale = 1.0,
		reverseTime = true,
		positionRandomness = 0.0,
		baseVelocity = new Vector3(-0.1, 0.05, 0),
		particleSpriteTexPath = './textures/particle2.png',
		velocityRandomness = 0.05,
		acceleration = new Vector3(0, 0, 0),
		baseColor = new Color(1.0, 0.0, 0.0),
		endColor = new Color(0.5, 1.0, 1.0),
		colorRandomness = 0.0,
		lifetime = 3,
		size = 5,
		sizeRandomness = 1.0,
		blending = NormalBlending;

	let velocity = new Vector3(0.0, 0.0, 0),
		color = new Color(1.0, 0, 0);

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
		const textureLoader = new TextureLoader();
		options.particleSpriteTex = textureLoader.load(particleSpriteTexPath);
		particleSystem = new GPUParticleSystem(options);
		clock = new Clock();
	});

	useFrame(() => {
		const delta = clock.getDelta() * options.timeScale;
		//console.log(spawnRate%100)
		//console.log(options.spawnRate);
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
					MathUtils.clamp(
						options.baseColor.r + particleSystem.random() * options.colorRandomness,
						0,
						1
					),
					MathUtils.clamp(
						options.baseColor.g + particleSystem.random() * options.colorRandomness,
						0,
						1
					),
					MathUtils.clamp(
						options.baseColor.b + particleSystem.random() * options.colorRandomness,
						0,
						1
					)
				);
				particleSystem.spawnParticle(options);
			}
			//original code used the render function's time
			//not sure if i'm doing this right
			particleSystem.update(clock.getElapsedTime());
		}
	});
</script>

{#if particleSystem}
	<Object3DInstance object={particleSystem} />
{/if}
