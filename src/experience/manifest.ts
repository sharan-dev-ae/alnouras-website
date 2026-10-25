export type Vector3Tuple = [number, number, number];
export interface LicensedAsset { url: string; sourceUrl: string; licenseUrl: string; approved: boolean; }
export interface CameraKeyframe { position: Vector3Tuple; target: Vector3Tuple; fov: number; }
export interface CollisionBox { min: Vector3Tuple; max: Vector3Tuple; }
export interface CloudAsset extends LicensedAsset { position: Vector3Tuple; width: number; height: number; opacity: number; }
export interface ExperienceManifest {
  enabled: boolean;
  architecture: LicensedAsset;
  environment: LicensedAsset;
  clouds: CloudAsset[];
  camera: CameraKeyframe[];
  collisionBoxes: CollisionBox[];
  modelScale: number;
}
const finiteTuple = (value: unknown): value is Vector3Tuple => Array.isArray(value) && value.length === 3 && value.every(Number.isFinite);
const safeUrl = (value: unknown) => typeof value === 'string' && ((value.startsWith('/') && !value.startsWith('//')) || /^https:\/\//i.test(value));
const approvedAsset = (value: unknown): value is LicensedAsset => {
  if (!value || typeof value !== 'object') return false;
  const asset = value as Partial<LicensedAsset>;
  return asset.approved === true && safeUrl(asset.url) && safeUrl(asset.sourceUrl) && safeUrl(asset.licenseUrl);
};
export function validateManifest(value: unknown): { ready: boolean; issues: string[]; manifest?: ExperienceManifest } {
  if (!value || typeof value !== 'object') return { ready: false, issues: ['No approved scene manifest has been configured.'] };
  const manifest = value as Partial<ExperienceManifest>;
  if (manifest.enabled !== true) return { ready: false, issues: ['The architectural scene is awaiting asset approval.'] };
  const issues: string[] = [];
  if (!approvedAsset(manifest.architecture)) issues.push('An approved architectural GLB with source and license records is required.');
  if (!approvedAsset(manifest.environment)) issues.push('An approved HDR lighting environment is required.');
  if (!Array.isArray(manifest.clouds) || manifest.clouds.length < 2 || manifest.clouds.some(cloud => !approvedAsset(cloud) || !finiteTuple(cloud.position) || !Number.isFinite(cloud.width) || cloud.width <= 0 || !Number.isFinite(cloud.height) || cloud.height <= 0 || !Number.isFinite(cloud.opacity) || cloud.opacity < 0 || cloud.opacity > 1)) issues.push('At least two approved photographic cloud layers with valid dimensions are required.');
  else if (new Set(manifest.clouds.map(cloud => cloud.url)).size !== manifest.clouds.length) issues.push('Cloud layers must use distinct photographic assets.');
  if (!Array.isArray(manifest.camera) || manifest.camera.length < 4 || manifest.camera.some(frame => !finiteTuple(frame.position) || !finiteTuple(frame.target) || !Number.isFinite(frame.fov) || frame.fov < 25 || frame.fov > 70 || frame.position.every((v,index) => v === frame.target[index]))) issues.push('Four or more valid, authored camera poses are required.');
  if (!Array.isArray(manifest.collisionBoxes) || manifest.collisionBoxes.length === 0 || manifest.collisionBoxes.some(box => !finiteTuple(box.min) || !finiteTuple(box.max) || box.min.some((v,index) => v >= box.max[index]))) issues.push('Authored building collision volumes are required before enabling the camera path.');
  if (!Number.isFinite(manifest.modelScale) || Number(manifest.modelScale) <= 0) issues.push('A positive, verified model scale is required.');
  return issues.length ? { ready: false, issues } : { ready: true, issues: [], manifest: manifest as ExperienceManifest };
}
