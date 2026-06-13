import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, useGLTF, useTexture, Decal, OrbitControls } from '@react-three/drei';
import { useSnapshot } from 'valtio';
import * as THREE from 'three';
import { easing } from 'maath';
import state from '../store';

const TeaserShirt = () => {
  const snap = useSnapshot(state);
  const meshRef = useRef();
  
  // Load the shirt model and front logo texture
  const { nodes, materials } = useGLTF('/shirt.glb');
  const logoTexture = useTexture(snap.frontLogoDecal);

  // Create a custom material that looks like high-quality fabric
  const shirtMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(snap.color),
      roughness: 0.8,
      metalness: 0.1,
    });
  }, []);

  // Smooth color transition on change
  useFrame((state, delta) => {
    easing.dampC(shirtMaterial.color, snap.color, 0.25, delta);
    
    // Slow idle rotation on Y axis
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh
        castShadow
        geometry={nodes.T_Shirt_male.geometry}
        material={shirtMaterial}
        dispose={null}
        scale={0.88}
      >
        <Decal
          position={[0, 0.04, 0.15]}
          rotation={[0, 0, 0]}
          scale={0.15}
          map={logoTexture}
          depthTest={false}
          depthWrite={true}
        />
      </mesh>
    </group>
  );
};

const TeaserCanvas = () => {
  return (
    <div className="w-full h-full min-h-[300px] md:min-h-[400px] relative cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 2.2], fov: 35 }}
        gl={{ preserveDrawingBuffer: true }}
        className="w-full h-full"
      >
        {/* Ambient lighting */}
        <ambientLight intensity={0.4} />

        {/* Studio 3-point lighting setup for premium 3D look */}
        {/* 1. Key light */}
        <directionalLight
          position={[3, 6, 4]}
          intensity={1.8}
          castShadow
          color="#fff8f0"
        />

        {/* 2. Fill light */}
        <directionalLight
          position={[-4, 2, -2]}
          intensity={0.6}
          color="#d0d0ff"
        />

        {/* 3. Rim/Backlight */}
        <directionalLight
          position={[0, 4, -6]}
          intensity={0.9}
          color="#ffffff"
        />

        {/* 4. Ground Bounce */}
        <pointLight
          position={[0, -2, 2]}
          intensity={0.3}
          color="#8844ff"
        />

        <Suspense fallback={null}>
          <Center>
            <TeaserShirt />
          </Center>
        </Suspense>

        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>

      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/20 backdrop-blur-sm rounded-2xl">
          <div className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } />
    </div>
  );
};

export default TeaserCanvas;
