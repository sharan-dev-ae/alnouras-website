import { Suspense, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, useEnvironment, useGLTF, useTexture } from '@react-three/drei';
import { ACESFilmicToneMapping, Material, Mesh, PerspectiveCamera, SRGBColorSpace, Texture, type BufferGeometry } from 'three';
import { createCameraPath } from './CameraPath';
import type { ExperienceManifest } from './manifest';

export interface SceneDriver { progress: number; invalidate?: () => void; }

function Camera({ driver, manifest }: { driver: SceneDriver; manifest: ExperienceManifest }) {
  const { camera, invalidate } = useThree();
  const path = useMemo(() => { const result = createCameraPath(manifest.camera); if (result.intersects(manifest.collisionBoxes)) throw new Error('The authored camera path intersects a building exclusion volume.'); return result; }, [manifest]);
  useEffect(() => { driver.invalidate = invalidate; invalidate(); return () => { driver.invalidate = undefined; }; }, [driver, invalidate]);
  useFrame(() => {
    const pose = path.sample(driver.progress);
    camera.position.copy(pose.position); camera.quaternion.copy(pose.quaternion);
    const perspective = camera as PerspectiveCamera;
    if (Math.abs(perspective.fov - pose.fov) > 0.001) { perspective.fov = pose.fov; perspective.updateProjectionMatrix(); }
  });
  return null;
}
function Architecture({ manifest }: { manifest: ExperienceManifest }) {
  const gltf = useGLTF(manifest.architecture.url);
  const owned = useMemo(() => {
    const scene = gltf.scene.clone(true);
    const geometries = new Set<BufferGeometry>(), materials = new Set<Material>(), textures = new Set<Texture>();
    scene.traverse(object => {
      if (!(object instanceof Mesh)) return;
      object.geometry = object.geometry.clone(); geometries.add(object.geometry);
      const clone = (source: Material) => {
        const material = source.clone(); materials.add(material);
        for (const [key,value] of Object.entries(material)) if (value instanceof Texture) { const texture = value.clone(); texture.needsUpdate = true; textures.add(texture); (material as unknown as Record<string,unknown>)[key] = texture; }
        return material;
      };
      object.material = Array.isArray(object.material) ? object.material.map(clone) : clone(object.material);
      object.castShadow = true; object.receiveShadow = true;
    });
    return { scene, dispose() { geometries.forEach(value => value.dispose()); materials.forEach(value => value.dispose()); textures.forEach(value => value.dispose()); } };
  }, [gltf.scene]);
  useEffect(() => () => { owned.dispose(); useGLTF.clear(manifest.architecture.url); }, [owned, manifest.architecture.url]);
  return <primitive object={owned.scene} scale={manifest.modelScale} dispose={null}/>;
}
function CloudLayers({ manifest }: { manifest: ExperienceManifest }) {
  const textures = useTexture(manifest.clouds.map(cloud => cloud.url));
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => { textures.forEach(texture => { texture.colorSpace = SRGBColorSpace; texture.needsUpdate = true; }); invalidate(); return () => { textures.forEach(texture => texture.dispose()); useTexture.clear(manifest.clouds.map(cloud => cloud.url)); }; }, [textures, manifest.clouds, invalidate]);
  return <>{manifest.clouds.map((cloud,index) => <mesh key={cloud.url} position={cloud.position} renderOrder={index + 1}><planeGeometry args={[cloud.width,cloud.height]}/><meshStandardMaterial map={textures[index]} transparent opacity={cloud.opacity} depthWrite={false} roughness={1}/></mesh>)}</>;
}
function Contents({ manifest, driver, onReady }: { manifest: ExperienceManifest; driver: SceneDriver; onReady: () => void }) {
  useEffect(onReady, [onReady]);
  useEffect(() => () => useEnvironment.clear({ files: manifest.environment.url }), [manifest.environment.url]);
  return <><Camera manifest={manifest} driver={driver}/><Environment files={manifest.environment.url} background/><ambientLight intensity={0.2}/><directionalLight position={[120,350,180]} intensity={2.5} castShadow shadow-mapSize={[1024,1024]} shadow-normalBias={0.05}/><fog attach="fog" args={['#b9c9d8',250,1800]}/><Architecture manifest={manifest}/><CloudLayers manifest={manifest}/></>;
}
export default function ArchitectureScene({ manifest, driver, onReady }: { manifest: ExperienceManifest; driver: SceneDriver; onReady: () => void }) {
  return <Canvas frameloop="demand" dpr={[1,1.5]} shadows camera={{ position: manifest.camera[0].position, fov: manifest.camera[0].fov, near: 0.5, far: 6000 }} gl={{ antialias: true, powerPreference: 'high-performance' }} onCreated={({gl}) => { gl.toneMapping = ACESFilmicToneMapping; gl.toneMappingExposure = 1; }} fallback={<span>3D is unavailable. The photographic homepage remains accessible.</span>}><Suspense fallback={null}><Contents manifest={manifest} driver={driver} onReady={onReady}/></Suspense></Canvas>;
}
