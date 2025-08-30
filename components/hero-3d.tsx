"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useMemo } from "react";

function Crops() {
  const positions = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let x = -2; x <= 2; x += 1) {
      for (let z = -1.5; z <= 1.5; z += 1) {
        pts.push([x * 0.6, 0.15, z * 0.6]);
      }
    }
    return pts;
  }, []);

  return (
    <>
      {positions.map((p, i) => (
        <mesh key={i} position={p} castShadow receiveShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
      ))}
    </>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[6, 4]} />
      <meshStandardMaterial color="#a3e635" />
    </mesh>
  );
}

export default function Hero3DScene() {
  return (
    <div className="h-64 w-full md:h-80 lg:h-96 rounded-xl overflow-hidden border border-white/30 shadow-sm glass-card">
      <Canvas shadows camera={{ position: [2.2, 2.2, 2.2], fov: 50 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 2]} intensity={1} castShadow />
        <Suspense fallback={null}>
          <group>
            <Ground />
            <Crops />
          </group>
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
      </Canvas>
    </div>
  );
}