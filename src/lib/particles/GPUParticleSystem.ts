import * as THREE from 'three';
import { Euler } from 'three';

const GPUParticleShader = {
	vertexShader: `
        uniform float uTime;
        uniform float uScale;
        uniform bool reverseTime;
        uniform float fadeIn;
        uniform float fadeOut;
				uniform vec4 origin;

        attribute vec3 positionStart;
        attribute float startTime;
        attribute vec3 velocity;
        attribute vec3 acceleration;
        attribute vec3 color;
        attribute vec3 endColor;
        attribute float size;
        attribute float lifeTime;

        varying vec4 vColor;
        varying vec4 vEndColor;
        varying float lifeLeft;
        varying float alpha;

        void main() {
            vColor = vec4( color, 1.0 );
            vEndColor = vec4( endColor, 1.0);
            vec3 newPosition;

            float timeElapsed = uTime - startTime;
            if(reverseTime) timeElapsed = lifeTime - timeElapsed;
            if(timeElapsed < fadeIn) {
                alpha = timeElapsed/fadeIn;
            }
            if(timeElapsed >= fadeIn && timeElapsed <= (lifeTime - fadeOut)) {
                alpha = 1.0;
            }
            if(timeElapsed > (lifeTime - fadeOut)) {
                alpha = 1.0 - (timeElapsed - (lifeTime-fadeOut))/fadeOut;
            }

            //gl_PointSize = ( uScale * size ) * lifeLeft;
            newPosition = positionStart 
                + (velocity * timeElapsed)
                + (acceleration * 0.5 * timeElapsed * timeElapsed)
                ;
						newPosition = newPosition*vec3(1,1.f+(sin(uTime)*0.1),1);
												vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
						float cameraDist = distance(mvPosition, origin);
            
            lifeLeft = 1.0 - ( timeElapsed / lifeTime );
						gl_PointSize = ( uScale * size )/cameraDist;
            if (lifeLeft < 0.0) { 
                lifeLeft = 0.0; 
                gl_PointSize = 0.;
            }
            //while active use the new position
            if( timeElapsed > 0.0 ) {
                gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
            } else {
                //if dead use the initial position and set point size to 0
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                lifeLeft = 0.0;
                gl_PointSize = 0.;
            }
        }
        `,
	fragmentShader: `
        varying vec4 vColor;
        varying vec4 vEndColor;
        varying float lifeLeft;
        varying float alpha;
        uniform sampler2D tSprite;
        void main() {
            // color based on particle texture and the lifeLeft. 
            // if lifeLeft is 0 then make invisible
            vec4 tex = texture2D( tSprite, gl_PointCoord );
            vec4 color = mix(vColor, vEndColor, 1.0-lifeLeft);
            gl_FragColor = vec4( color.rgb*tex.rgb, alpha * tex.a);
        }

    `
};

const UPDATEABLE_ATTRIBUTES = [
	'positionStart',
	'startTime',
	'velocity',
	'acceleration',
	'color',
	'endColor',
	'size',
	'lifeTime'
];
export default class GPUParticleSystem extends THREE.Object3D {
	blending: THREE.Blending;
	PARTICLE_COUNT: number;
	PARTICLE_CURSOR: number;
	time: number;
	offset: number;
	count: number;
	DPR: number;
	onTick: Function;
	particleUpdate: boolean;
	reverseTime: boolean;
	fadeIn: number;
	fadeOut: number;
	rand: number[];
	i: number;
	sprite: THREE.Texture;
	material: THREE.ShaderMaterial;
	geometry: THREE.BufferGeometry;
	particleSystem: THREE.Points;
	particleSpriteTex: THREE.Texture;

	constructor(options) {
		super();
		options = options || {};
		this.blending = options.blending ? options.blending : THREE.NormalBlending;
		this.PARTICLE_COUNT = options.maxParticles || 1000000;
		this.PARTICLE_CURSOR = 0;
		this.time = 0;
		this.offset = 0;
		this.count = 0;
		this.DPR = window.devicePixelRatio;
		this.particleUpdate = false;
		this.onTick = options.onTick;
		(this.particleSpriteTex = options.particleSpriteTex), (this.reverseTime = options.reverseTime);
		this.fadeIn = options.fadeIn || 1;
		if (this.fadeIn === 0) this.fadeIn = 0.001;
		this.fadeOut = options.fadeOut || 1;
		if (this.fadeOut === 0) this.fadeOut = 0.001;

		// preload a 10_000 random numbers from -0.5 to 0.5
		this.rand = [];
		let i;
		for (i = 1e5; i > 0; i--) {
			this.rand.push(Math.random() - 0.5);
		}
		this.i = i;

		//setup the texture
		this.sprite = options.particleSpriteTex || null;
		if (!this.sprite) throw new Error('No particle sprite texture specified');
		this.sprite.wrapS = this.sprite.wrapT = THREE.RepeatWrapping;

		//setup the shader material
		this.material = new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			uniforms: {
				uTime: {
					value: 0.0
				},
				uScale: {
					value: 1.0
				},
				tSprite: {
					value: this.sprite
				},
				reverseTime: {
					value: this.reverseTime
				},
				fadeIn: {
					value: this.fadeIn
				},
				fadeOut: {
					value: this.fadeOut
				}
			},
			blending: this.blending,
			vertexShader: GPUParticleShader.vertexShader,
			fragmentShader: GPUParticleShader.fragmentShader
		});

		// define defaults for all values
		this.material.defaultAttributeValues.particlePositionsStartTime = [0, 0, 0, 0];
		this.material.defaultAttributeValues.particleVelColSizeLife = [0, 0, 0, 0];

		// geometry
		this.geometry = new THREE.BufferGeometry();

		//vec3 attributes
		this.geometry.setAttribute(
			'position',
			new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT * 3), 3).setUsage(
				THREE.DynamicDrawUsage
			)
		);
		this.geometry.setAttribute(
			'positionStart',
			new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT * 3), 3).setUsage(
				THREE.DynamicDrawUsage
			)
		);
		this.geometry.setAttribute(
			'velocity',
			new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT * 3), 3).setUsage(
				THREE.DynamicDrawUsage
			)
		);
		this.geometry.setAttribute(
			'acceleration',
			new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT * 3), 3).setUsage(
				THREE.DynamicDrawUsage
			)
		);
		this.geometry.setAttribute(
			'color',
			new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT * 3), 3).setUsage(
				THREE.DynamicDrawUsage
			)
		);
		this.geometry.setAttribute(
			'endColor',
			new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT * 3), 3).setUsage(
				THREE.DynamicDrawUsage
			)
		);

		//scalar attributes
		this.geometry.setAttribute(
			'startTime',
			new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT), 1).setUsage(
				THREE.DynamicDrawUsage
			)
		);
		this.geometry.setAttribute(
			'size',
			new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT), 1).setUsage(
				THREE.DynamicDrawUsage
			)
		);
		this.geometry.setAttribute(
			'lifeTime',
			new THREE.BufferAttribute(new Float32Array(this.PARTICLE_COUNT), 1).setUsage(
				THREE.DynamicDrawUsage
			)
		);

		this.particleSystem = new THREE.Points(this.geometry, this.material);
		this.particleSystem.frustumCulled = false;
		this.add(this.particleSystem);
	}

	//wrote a type guard so that ts doesn't complain further down
	isBufferAttribute = (
		attribute: THREE.BufferAttribute | THREE.InterleavedBufferAttribute
	): attribute is THREE.BufferAttribute => {
		if ((attribute as THREE.BufferAttribute).updateRange !== undefined) {
			return true;
		}
		return false;
	};

	/*
      This updates the geometry on the shader if at least one particle has been spawned.
      It uses the offset and the count to determine which part of the data needs to actually
      be sent to the GPU. This ensures no more data than necessary is sent.
     */

	geometryUpdate() {
		if (this.particleUpdate === true) {
			this.particleUpdate = false;
			UPDATEABLE_ATTRIBUTES.forEach((name) => {
				const attr = this.geometry.getAttribute(name);
				if (this.isBufferAttribute(attr)) {
					if (this.offset + this.count < this.PARTICLE_COUNT) {
						attr.updateRange.offset = this.offset * attr.itemSize;
						attr.updateRange.count = this.count * attr.itemSize;
					} else {
						attr.updateRange.offset = 0;
						attr.updateRange.count = -1;
					}
				}
				attr.needsUpdate = true;
			});
			this.offset = 0;
			this.count = 0;
		}
	}

	//use one of the random numbers
	random() {
		return ++this.i >= this.rand.length ? this.rand[(this.i = 1)] : this.rand[this.i];
	}

	update(ttime) {
		this.time = ttime; //nothing seemed to move so I removed a division by 1000 here
		this.material.uniforms.uTime.value = this.time;
		if (this.onTick) this.onTick(this, this.time);
		this.geometryUpdate();
	}

	dispose() {
		this.material.dispose();
		this.sprite.dispose();
		this.geometry.dispose();
	}

	/* spawn a particle
    This works by updating values inside of
    the attribute arrays, then updates the count and the PARTICLE_CURSOR and
    sets particleUpdate to true.
    This if spawnParticle is called three times in a row before rendering,
    then count will be 3 and the cursor will have moved by three.
     */
	spawnParticle(options) {
		let position = new THREE.Vector3();
		let velocity = new THREE.Vector3();
		let acceleration = new THREE.Vector3();
		let color = new THREE.Color();
		let endColor = new THREE.Color();

		const positionStartAttribute = this.geometry.getAttribute('positionStart');
		const startTimeAttribute = this.geometry.getAttribute('startTime');
		const velocityAttribute = this.geometry.getAttribute('velocity');
		const accelerationAttribute = this.geometry.getAttribute('acceleration');
		const colorAttribute = this.geometry.getAttribute('color');
		const endcolorAttribute = this.geometry.getAttribute('endColor');
		const sizeAttribute = this.geometry.getAttribute('size');
		const lifeTimeAttribute = this.geometry.getAttribute('lifeTime');

		options = options || {};

		// setup reasonable default values for all arguments
		position =
			options.position !== undefined ? position.copy(options.position) : position.set(0, 0, 0);
		velocity =
			options.velocity !== undefined ? velocity.copy(options.velocity) : velocity.set(0, 0, 0);
		acceleration =
			options.acceleration !== undefined
				? acceleration.copy(options.acceleration)
				: acceleration.set(0, 0, 0);
		color = options.baseColor !== undefined ? color.copy(options.baseColor) : color.set(0xffffff);
		endColor =
			options.endColor !== undefined ? endColor.copy(options.endColor) : endColor.copy(color);

		const lifetime = options.lifetime !== undefined ? options.lifetime : 5;
		let size = options.size !== undefined ? options.size : 10;
		const sizeRandomness = options.sizeRandomness !== undefined ? options.sizeRandomness : 0;
		const positionRandomness =
			options.positionRandomness !== undefined ? options.positionRandomness : 0;
		const velocityRandomness =
			options.velocityRandomness !== undefined ? options.velocityRandomness : 0;

		if (this.DPR !== undefined) size *= this.DPR;

		const i = this.PARTICLE_CURSOR;

		//I'm diverging from the tut's code here, because changing values in the attribute array
		//is a no-no

		// position
		positionStartAttribute.setXYZ(
			i,
			position.x + this.random() * positionRandomness,
			position.y + this.random() * positionRandomness,
			position.z + this.random() * positionRandomness
		);
		accelerationAttribute.setXYZ(i, acceleration.x, acceleration.y, acceleration.z);
		colorAttribute.setXYZ(i, color.r, color.g, color.b);
		endcolorAttribute.setXYZ(i, endColor.r, endColor.g, endColor.b);
		velocityAttribute.setXYZ(
			i,
			velocity.x,
			velocity.y + this.random() * velocityRandomness,
			velocity.z
		);

		//size, lifetime and starttime
		sizeAttribute.setX(i, size + this.random() * sizeRandomness);
		lifeTimeAttribute.setX(i, lifetime);
		startTimeAttribute.setX(i, this.time + this.random() * 2e-2);

		// offset
		if (this.offset === 0) this.offset = this.PARTICLE_CURSOR;

		// counter and cursor
		this.count++;
		this.PARTICLE_CURSOR++;

		//wrap the cursor around
		if (this.PARTICLE_CURSOR >= this.PARTICLE_COUNT) this.PARTICLE_CURSOR = 0;
		this.particleUpdate = true;
	}

	getCount() {
		return this.count;
	}
}
