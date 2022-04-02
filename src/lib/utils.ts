import { Box3, MathUtils } from 'three';
import { Vector3, BoxBufferGeometry, Matrix4 } from 'three';
import { scaleLog, scaleLinear, maxIndex } from 'd3';
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
	const color = scaleLinear(
		[0, AQG, interimTargets[interimTargets.length - 1], interimTargets[0]],
		['white', 'green', 'yellow', 'red']
	);
	return color(value);
}

export function getScaledValue(component: string, value: number): number {
	if (targets[component] == undefined) return;
	const { interimTargets, AQG } = targets[component];
	const max = interimTargets[0] > value ? interimTargets[0] : value;
	const scale = scaleLinear(
		[0, AQG, interimTargets[interimTargets.length - 1], max],
		[0, 25, 50, 100]
	);
	return scale(value);
}

export function getHighestAlarmColor(values: StationData): string {
	const latestHMWs = Object.entries(values).map((value) => [
		value[0],
		getLatest(value[1].hmw)?.value
	]);
	const scaledHMWs = latestHMWs.map((component) =>
		getScaledValue(component[0]?.toString(), parseFloat(component[1]?.toString()))
	);
	const component = latestHMWs[maxIndex(scaledHMWs)];
	/* 	let scaledValues = {};
	Object.entries(values).forEach((value) => {
		scaledValues[value[0]] = getScaledValue(value[0], getLatest(value[1].hmw).value);
	});
	Object.entries(sva) */
	return getAlarmColor(component[0].toString(), parseFloat(component[1]?.toString()));
}

export function calcSeverity(component: string, value: number): number {
	const { interimTargets, AQG } = targets[component];
	const max = interimTargets[0] > value ? interimTargets[0] : value;
	const severity = scaleLog().domain([0.01, AQG, max]).range([0, 100, 2000]);
	//console.log(component, severity(value));
	return severity(value);
}

export function countComponents(data: StationData): number {
	return Object.entries(data).filter((component) => {
		console.log('COMP: ', component);
		return !component[0].startsWith('WI') && component[1].hmw.length > 0;
	}).length;
}
