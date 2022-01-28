<script lang="ts">
	import * as THREE from 'three';

	import * as SC from 'svelte-cubed';
	import { onMount } from 'svelte';

	import GPUParticleSystem from './GPUParticleSystem';

	let particleSystem, options, spawnerOptions
	
    function setupScene() {
        const textureLoader = new THREE.TextureLoader();
		
        options = {
            maxParticles: 10000,
            position: new THREE.Vector3(0,0,0),
            positionRandomness: 0.0,
            baseVelocity: new THREE.Vector3(0.0, 0.0, 0),
            velocity: new THREE.Vector3(0.0, 0.0, 0.0),
            particleSpriteTex: textureLoader.load('./textures/particle2.png'),
            velocityRandomness: 0.5,
            acceleration: new THREE.Vector3(0,0,0),
            baseColor: new THREE.Color(1.0,1.0,0.5),
            color: new THREE.Color(1.0,0,0),
            colorRandomness: 0.5,
            lifetime: 1,
            size: 10,
            sizeRandomness: 1.0,
            blending: THREE.AdditiveBlending,
        }
        
        spawnerOptions = {
            spawnRate: 5, // create at the rate of 500 particles/sec
            timeScale: 1.0
        };

        particleSystem = new GPUParticleSystem(options)
	}

	onMount(() => {
		setupScene();
	});

 	const clock = new THREE.Clock();
	SC.onFrame(() => {
        const delta = clock.getDelta() * spawnerOptions.timeScale;
        if ( delta > 0 ) {
            //spawn the correct number of particles for this frame based on the spawn rate
            for ( let x = 0; x < spawnerOptions.spawnRate * delta; x++ ) {
                options.velocity.x = options.baseVelocity.x + particleSystem.random() * options.velocityRandomness
                options.velocity.y = options.baseVelocity.y + particleSystem.random() * options.velocityRandomness
                options.velocity.z = options.baseVelocity.z + particleSystem.random() * options.velocityRandomness
                options.color.setRGB(
                    THREE.MathUtils.clamp(options.baseColor.r+particleSystem.random()*options.colorRandomness,0,1),
                    THREE.MathUtils.clamp(options.baseColor.g+particleSystem.random()*options.colorRandomness,0,1),
                    THREE.MathUtils.clamp(options.baseColor.b+particleSystem.random()*options.colorRandomness,0,1),
                )
                particleSystem.spawnParticle( options );
            }
        }

        particleSystem.update(clock.getElapsedTime());
		
	});
</script>

{#if particleSystem}
	<SC.Primitive object={particleSystem} scale={[10, 10, 10]} />
{/if}
