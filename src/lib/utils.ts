import { Box3, MathUtils } from 'three';
import { Vector3, BoxBufferGeometry, Matrix4 } from 'three';
import { scaleLog, scaleLinear } from 'd3';
import type { GLTF } from 'threlte';

import { poi, camPos } from '$lib/stores';

export function getLuftiPositions(model: GLTF): LuftiData {
	let stationGeometry: LuftiData = <LuftiData>{};
	model.scene.children
		.filter((obj) => obj.name.startsWith('S'))
		.forEach((obj) => {
			stationGeometry[obj.name] = {
				position: { ...obj.position },
				boundingBox: { ...obj.geometry.boundingBox },
				scale: { ...obj.scale },
				rotation: { x: obj.rotation._x, y: obj.rotation._y, z: obj.rotation._z }
			};
		});
	return stationGeometry;
}

export function boxGeometryFromBoundingBox(boundingBox: Box3): BoxBufferGeometry {
	// make a BoxBufferGeometry of the same size as Box3
	const dimensions = new Vector3().subVectors(boundingBox.max, boundingBox.min);
	const boxGeo = new BoxBufferGeometry(dimensions.x, dimensions.y, dimensions.z);
	// move new mesh center so it's aligned with the original object
	const matrix = new Matrix4().setPosition(
		dimensions.addVectors(boundingBox.min, boundingBox.max).multiplyScalar(0.5)
	);
	boxGeo.applyMatrix4(matrix);
	return boxGeo;
}

export function vectorFromDegreesAndVelocity(deg: number, v: number, multiplier?: number): Vector3 {
	const rad = MathUtils.degToRad(deg);
	const x = Math.sin(rad);
	const y = Math.cos(rad);
	let calcDeg = MathUtils.radToDeg(Math.atan2(x, y));
	const vec = new Vector3(x, 0, y);
	console.log(deg, vec, calcDeg);
	return vec.multiplyScalar(v * (multiplier < 0 ? multiplier : 0.1));
}

export function getLatest(array:Measurement[]):Measurement {
	return array[array.length - 1];
}

/* 


*/

export function calcSeverity(component: string, value: number): number {
	const targets = {
		//Table 3.6 p.88
		PM25: {
			interimTargets: [75, 50, 37.5, 25, 15],
			AQG: 15
		},
		//Table 3.9 p.97
		PM10: {
			interimTargets: [150, 100, 75, 50, 45],
			AQG: 15
		},
		//Table 3.15 p.110
		O3: {
			interimTargets: [160, 120],
			AQG: 100
		},
		//Table 3.21 p.124
		NO2: {
			interimTargets: [120, 50],
			AQG: 25
		},
		//Table 3.22 p.130
		SO2: {
			interimTargets: [125, 50],
			AQG: 40
		}
	};

	const { interimTargets, AQG } = targets[component];
	const severity = scaleLog()
		.domain([0.01, AQG, interimTargets[0]])
		.range([0, 500, 2000]);
	console.log(component, severity(value));
	return severity(value);
}

export function setCamera(pos) {
	poi.set(pos);
	camPos.set({
		x: pos.x + 2,
		y: pos.y + 2,
		z: pos.z + 2
	});
}
