import * as THREE from "three";

const up = new THREE.Vector3(0, 0, 1);

export const poseOnSurface = (
    pointWorld: THREE.Vector3,
    normalWorld: THREE.Vector3,
    spin: number,
    shirt: THREE.Object3D,
) => {
    shirt.updateWorldMatrix(true, false);
    const localPoint = shirt.worldToLocal(pointWorld.clone());
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(shirt.matrixWorld).invert();
    const localNormal = normalWorld.clone().applyMatrix3(normalMatrix).normalize();
    if (localNormal.lengthSq() < 1e-8) localNormal.copy(up);
    return {
        decalPosition: [localPoint.x, localPoint.y, localPoint.z] as [number, number, number],
        decalRotation: rotationFromNormal(localNormal, spin),
    };
};

export const normalFromRotation = (rotation: number[]) => {
    const euler = new THREE.Euler(rotation[0] || 0, rotation[1] || 0, rotation[2] || 0);
    return up.clone().applyEuler(euler).normalize();
};

export const spinFromRotation = (rotation: number[]) => {
    const euler = new THREE.Euler(rotation[0] || 0, rotation[1] || 0, rotation[2] || 0);
    const quaternion = new THREE.Quaternion().setFromEuler(euler);
    const normal = up.clone().applyQuaternion(quaternion).normalize();
    const base = new THREE.Quaternion().setFromUnitVectors(up, normal);
    const spin = base.invert().multiply(quaternion);
    return 2 * Math.atan2(spin.z, spin.w);
};

export const rotationFromNormal = (normal: THREE.Vector3, spin: number): [number, number, number] => {
    const direction = normal.clone().normalize();
    if (direction.lengthSq() < 1e-8) direction.copy(up);
    const align = new THREE.Quaternion().setFromUnitVectors(up, direction);
    const twist = new THREE.Quaternion().setFromAxisAngle(direction, spin);
    align.premultiply(twist);
    const euler = new THREE.Euler().setFromQuaternion(align);
    return [euler.x, euler.y, euler.z];
};

export const worldNormalFromHit = (hit: THREE.Intersection, shirt: THREE.Object3D) => {
    const normal = hit.face?.normal.clone() ?? up.clone();
    return normal.transformDirection(shirt.matrixWorld).normalize();
};
