<script lang="ts">
	//import * as THREE from 'three';
	import { Object3DInstance, Position, Rotation, useThrelte } from 'threlte';
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
	import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass';

	const TRAIL_LENGTH = 0.5;
	let particleSystem:GPUParticleSystem; //, clock;

	export const count = 0;

	//const {clock} = useThrelte();

	export let maxParticles = 600,
		position: Position = { x: 0, y: 0, z: 0 },
		timeScale = 1,
		reverseTime = false,
		positionRandomness = 0.5,
		baseVelocity = new Vector3(0, 0, 0),
		spawnRate = 1,
		velocityRandomness = 0,
		lifetime = 1 + TRAIL_LENGTH / Math.hypot(baseVelocity.x, baseVelocity.y, baseVelocity.z),
		fadeIn = lifetime / 2,
		fadeOut = lifetime / 3,
		particleSpriteTexPath = './textures/particle2.png',
		acceleration = new Vector3(0, 0, 0),
		baseColor = new Color(1.0, 1.0, 1.0),
		endColor = new Color(1, 1, 1),
		colorRandomness = 0.0,
		blending = NormalBlending,
		size = 1,
		sizeRandomness = 0.5;

	let velocity = new Vector3(0.0, 0.0, 0),
		color = new Color(1.0, 0, 0);
	let fullSecond = 0;
	spawnRate = spawnRate * Math.hypot(baseVelocity.x, baseVelocity.y, baseVelocity.z);
	//TRAIL_LENGTH / Math.hypot(baseVelocity.x, baseVelocity.y, baseVelocity.z)
	console.log(spawnRate);

	$: options = {
		maxParticles,
		spawnRate,
		timeScale,
		reverseTime,
		fadeIn,
		fadeOut,
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
		const { clock } = ctx;
		if (delta > 0) {
			//spawn the correct number of particles for this frame based on the spawn rate
			fullSecond += delta;
			//console.log('second', fullSecond);
			if (options.spawnRate * fullSecond >= 1) {
				for (let x = 0; x < options.spawnRate * fullSecond; x++) {
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
					//console.log(spawnCount, delta)
					particleSystem.spawnParticle(options);
				}
				fullSecond = 0;
			}

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

<style>
</style>
