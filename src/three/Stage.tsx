import React, { useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useVideoConfig } from "remotion";

export type Cam = { pos: [number, number, number]; target: [number, number, number]; fov: number };

const Rig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera, gl } = useThree();
  gl.localClippingEnabled = true;
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(...cam.pos);
  c.fov = cam.fov;
  c.updateProjectionMatrix();
  c.lookAt(...cam.target);
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
  }, [gl]);
  return null;
};

/** ThreeCanvas with a frame-driven camera. Children must animate from useCurrentFrame only. */
export const Stage: React.FC<{ cam: Cam; children: React.ReactNode; fog?: [string, number, number] }> = ({ cam, children, fog }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} gl={{ antialias: true, alpha: true }} camera={{ fov: cam.fov, position: cam.pos, near: 0.1, far: 200 }}>
      <Rig cam={cam} />
      {fog ? <fog attach="fog" args={fog} /> : null}
      {children}
    </ThreeCanvas>
  );
};

/** Project a world point to screen pixels with the same camera the Stage uses (for HTML labels). */
export const project = (cam: Cam, p: [number, number, number], width = 1280, height = 720) => {
  const c = new THREE.PerspectiveCamera(cam.fov, width / height, 0.1, 200);
  c.position.set(...cam.pos);
  c.lookAt(...cam.target);
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  return { x: ((v.x + 1) / 2) * width, y: ((1 - v.y) / 2) * height };
};
