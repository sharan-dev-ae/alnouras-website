import { CatmullRomCurve3, MathUtils, Matrix4, Quaternion, Vector3 } from 'three';
import type { CameraKeyframe, CollisionBox } from './manifest';

export function createCameraPath(keyframes: CameraKeyframe[]) {
  if (keyframes.length < 4) throw new Error('At least four authored camera poses are required.');
  const positions = new CatmullRomCurve3(keyframes.map(frame => new Vector3(...frame.position)), false, 'centripetal');
  const targets = new CatmullRomCurve3(keyframes.map(frame => new Vector3(...frame.target)), false, 'centripetal');
  const up = new Vector3(0, 1, 0);
  const position = new Vector3(), target = new Vector3();
  const rotation = new Matrix4();
  const quaternion = new Quaternion();
  return {
    sample(progress: number) {
      const p = MathUtils.clamp(Number.isFinite(progress) ? progress : 0, 0, 1);
      positions.getPoint(p, position); targets.getPoint(p, target);
      rotation.lookAt(position, target, up); quaternion.setFromRotationMatrix(rotation);
      const frame = p * (keyframes.length - 1), index = Math.min(Math.floor(frame), keyframes.length - 2);
      const fov = MathUtils.lerp(keyframes[index].fov, keyframes[index + 1].fov, frame - index);
      return { position, target, quaternion, fov };
    },
    intersects(boxes: CollisionBox[], margin = 2) {
      for (let step = 0; step <= 2000; step++) {
        const point = positions.getPoint(step / 2000);
        if (boxes.some(box => point.x >= box.min[0] - margin && point.x <= box.max[0] + margin && point.y >= box.min[1] - margin && point.y <= box.max[1] + margin && point.z >= box.min[2] - margin && point.z <= box.max[2] + margin)) return true;
      }
      return false;
    },
  };
}
