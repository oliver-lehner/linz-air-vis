import { Box3, MathUtils} from "three";
import { Vector3, BoxBufferGeometry, Matrix4  } from "three";

	
  
  export function getLuftiPositions(model) {
    let stationGeometry: LuftiData = <LuftiData>{};
		model.scene.children
			.filter((obj) => obj.name.startsWith('S'))
			.forEach((obj) => {
				stationGeometry[obj.name] = {
					position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
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

	export function vectorFromDegreesAndVelocity(deg: number, v: number): Vector3 {
		const rad = MathUtils.degToRad(deg);
		const x = Math.cos(rad);
		const y = Math.sin(rad);
		const vec = new Vector3(x, 0, y);
		console.log(vec, v);
		return vec.multiplyScalar(v * 0.1);
	}