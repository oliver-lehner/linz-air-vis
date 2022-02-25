<script lang="ts">
	//import * as THREE from 'three';
	import { Object3DInstance, Position, useThrelte } from 'threlte';
	import { onMount } from 'svelte';
	import { useFrame } from 'threlte';

	import GPUParticleSystem from './GPUParticleSystem';
	import {
		AdditiveBlending,
		Clock,
		Color,
		MathUtils,
		SubtractiveBlending,
		NormalBlending,
		TextureLoader,
		Vector3,
		MultiplyBlending
	} from 'three';

	const TRAIL_LENGTH = 0.5;
	let particleSystem//, clock;

	//const {clock} = useThrelte();

	export let maxParticles = 600,
		position: Position = { x: 0, y: 0, z: 0 },
		spawnRate = 0,
		timeScale = 1,
		reverseTime = true,
		positionRandomness = 0.5,
		baseVelocity = new Vector3(0, 0, 0),
		particleSpriteTexPath = './textures/particle2.png',
		velocityRandomness = 0,
		acceleration = new Vector3(0, 0, 0),
		baseColor = new Color(1.0, 1.0, 1.0),
		endColor = new Color(0, 0, 0),
		colorRandomness = 0.0,
		lifetime = TRAIL_LENGTH / Math.hypot(baseVelocity.x, baseVelocity.y, baseVelocity.z),
		size = 100 * TRAIL_LENGTH,
		sizeRandomness = 10.0,
		blending = NormalBlending;

	let velocity = new Vector3(0.0, 0.0, 0),
		color = new Color(1.0, 0, 0)

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
		//clock = new Clock();
	});

	useFrame((ctx, delta) => {
		const {clock} = ctx;
		if (delta > 0) {
			//spawn the correct number of particles for this frame based on the spawn rate
			let spawnCount = 0;
			for (let x = 0; x < options.spawnRate * delta; x++) {
				spawnCount++;
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
			console.log(spawnCount)
			//original code used the render function's time
			//not sure if i'm doing this right
			//console.log(clock.getElapsedTime())
			particleSystem.update(clock.getElapsedTime());
		}
	});
</script>

{#if particleSystem}
	<Object3DInstance object={particleSystem} />
{/if}
