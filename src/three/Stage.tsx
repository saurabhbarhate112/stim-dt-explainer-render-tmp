import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { ThreeCanvas } from "@remotion/three";
import { useVideoConfig } from "remotion";

export type Vec3 = [number, number, number];
export type Cam = { pos: Vec3; target: Vec3; fov: number };

const Rig: React.FC<{ cam: Cam; exposure: number; envIntensity: number }> = ({ cam, exposure, envIntensity }) => {
  const { camera, gl, scene } = useThree();
  gl.localClippingEnabled = true;
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = exposure;
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    return pm.fromScene(new RoomEnvironment(), 0.03).texture;
  }, [gl]);
  useLayoutEffect(() => {
    scene.environment = env;
    scene.environmentIntensity = envIntensity;
  }, [scene, env, envIntensity]);
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(...cam.pos);
  c.fov = cam.fov;
  c.updateProjectionMatrix();
  c.lookAt(...cam.target);
  return null;
};

/** Bright studio: env reflections, key light with soft shadow, shadow-catcher floor. */
export const Studio: React.FC<{ floorY?: number; shadow?: number; key?: Vec3; keyIntensity?: number }> = ({ floorY = -0.04, shadow = 0.22, key = [3, 8, 4], keyIntensity = 2.2 }) => (
  <>
    <ambientLight intensity={0.35} />
    <directionalLight
      position={key}
      intensity={keyIntensity}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-left={-6}
      shadow-camera-right={6}
      shadow-camera-top={6}
      shadow-camera-bottom={-6}
      shadow-bias={-0.0004}
      shadow-radius={6}
    />
    <directionalLight position={[-5, 4, -3]} intensity={0.8} color="#dff5e8" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <shadowMaterial transparent opacity={shadow} />
    </mesh>
  </>
);

/** ThreeCanvas with a frame-driven camera. Children must animate from useCurrentFrame only. */
export const Stage: React.FC<{ cam: Cam; children: React.ReactNode; exposure?: number; envIntensity?: number }> = ({ cam, children, exposure = 1.0, envIntensity = 0.5 }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} shadows camera={{ fov: cam.fov, position: cam.pos, near: 0.05, far: 200 }}>
      <Rig cam={cam} exposure={exposure} envIntensity={envIntensity} />
      {children}
    </ThreeCanvas>
  );
};

/** Project a world point to screen pixels with the same camera the Stage uses (for HTML labels). */
export const project = (cam: Cam, p: Vec3, width = 1280, height = 720) => {
  const c = new THREE.PerspectiveCamera(cam.fov, width / height, 0.05, 200);
  c.position.set(...cam.pos);
  c.lookAt(...cam.target);
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  return { x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height };
};

/** Smooth camera path through keyframes [frame, cam]. */
export const camPath = (f: number, keys: [number, Cam][]): Cam => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, a] = keys[i];
    const [f1, b] = keys[i + 1];
    if (f <= f1) {
      const t0 = (f - f0) / (f1 - f0);
      const t = t0 < 0.5 ? 4 * t0 * t0 * t0 : 1 - Math.pow(-2 * t0 + 2, 3) / 2;
      const mix = (u: Vec3, v: Vec3): Vec3 => [u[0] + (v[0] - u[0]) * t, u[1] + (v[1] - u[1]) * t, u[2] + (v[2] - u[2]) * t];
      return { pos: mix(a.pos, b.pos), target: mix(a.target, b.target), fov: a.fov + (b.fov - a.fov) * t };
    }
  }
  return keys[keys.length - 1][1];
};
