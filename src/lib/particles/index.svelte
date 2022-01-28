<script lang="ts">
	import * as THREE from 'three';

	import * as SC from 'svelte-cubed';
	import { onMount } from 'svelte';

	import GPUParticleSystem from './GPUParticleSystem';

	const vertexShader = `uniform float time;
        attribute vec3 velocity;
        attribute vec3 acceleration;
        void main() {
            vec3 acc = acceleration * 0.5 * time * time;
            vec3 vel = velocity * time;
            gl_Position = projectionMatrix 
                * modelViewMatrix
                * vec4(acc + vel + position, 1.0);
            gl_PointSize = 10.0;
        }`;

	const fragmentShader = `varying vec3 vColor;
        void main() {
        gl_FragColor = vec4(0,1.0,0,1.0);
        }`;

	export const max = 100;
	const rand = (min, max) => min + Math.random() * (max - min);
	
    let mesh:THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
	let time = 0;
	
    function setupScene() {
		const initialPositions = [];
		const velocities = [];
		const accelerations = [];
		const geo = new THREE.BufferGeometry();
		
        for (let i = 0; i < max; i++) {
			initialPositions.push(rand(-0.5, 0.5));
			initialPositions.push(rand(-4, -3));
			initialPositions.push(rand(-1, 1));
			velocities.push(rand(-0.5, 0.5));
			velocities.push(10.0);
			velocities.push(rand(-1, 1));
			accelerations.push(0);
			accelerations.push(-9.8);
			accelerations.push(0);
		}
		
        geo.setAttribute('position', new THREE.Float32BufferAttribute(initialPositions, 3));
		geo.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
		geo.setAttribute('acceleration', new THREE.Float32BufferAttribute(accelerations, 3));
		
        const mat = new THREE.ShaderMaterial({
			uniforms: {
				time: { value: 12.0 }
			},
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true,
			vertexColors: true
		});
		mesh = new THREE.Points(geo, mat);
		mesh.position.z = 0;
	}

	onMount(() => {
		setupScene();
	});

 	const clock = new THREE.Clock();
	SC.onFrame(() => {
		let delta = clock.getDelta();
		time += 1 * delta;
        //console.log(time)
		mesh.material.uniforms.time.value = time;
		mesh.geometry.attributes.position.needsUpdate = true;
		mesh.geometry.attributes.velocity.needsUpdate = true;
		mesh.geometry.attributes.acceleration.needsUpdate = true;
	});
</script>

{#if mesh}
	<SC.Primitive object={mesh} scale={[1, 1, 1]} />
{/if}
