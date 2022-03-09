import { Box3, MathUtils } from 'three';
import { Vector3, BoxBufferGeometry, Matrix4 } from 'three';
import { scaleLog, scaleLinear } from 'd3';
import type { GLTF } from 'threlte';

import { targets } from '$lib/constants';

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
	const x = Math.cos(rad);
	const y = Math.sin(rad);
	let calcDeg = MathUtils.radToDeg(Math.atan2(x, y));
	const vec = new Vector3(x, 0, y);
	//console.log(deg, vec, calcDeg);
	return vec.multiplyScalar(v * (multiplier > 0 ? multiplier : 0.1));
}

export function getLatest(array: Measurement[]): Measurement {
	return array[array.length - 1];
}

export function getAlarmColor(component: string, value: number): string {
	const { interimTargets, AQG } = targets[component];
	if(value > AQG){
		if(value > interimTargets[0])
		return ''
	}
	
}

export function calcSeverity(component: string, value: number): number {
	const { interimTargets, AQG } = targets[component];
	const severity = scaleLog().domain([0.01, AQG, interimTargets[0]]).range([0, 5, 200]);
	//console.log(component, severity(value));
	return severity(value);
}

