import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, useGLTF, useTexture, Decal, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { easing } from 'maath';
import { useSnapshot } from 'valtio';
import state from '../store';

const HeroShirt = ({ hovered, setHovered }) => {
  const snap = useSnapshot(state);
  const meshRef = useRef();
  
  // Load the shirt model and default logo texture
  const { nodes, materials } = useGLTF('/shirt.glb');
  const logoTexture = useTexture(snap.frontLogoDecal);

  // Create a custom material that looks like high-quality fabric
  const shirtMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(snap.color),
      roughness: 0.8,
      metalness: 0.1,
      bumpScale: 0.05,
    });
    return mat;
  }, []);

  useFrame((state, delta) => {
    // Auto-rotate the shirt on Y axis
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.35;
    }

    // Smooth hover zoom using lerp
    const targetScale = hovered ? 1.05 : 0.85;
    const targetZ = hovered ? 0.12 : 0;
    
    if (meshRef.current) {
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.08);
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScale, 0.08);
      meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, targetScale, 0.08);
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.08);
    }

    // Smoothly transition colors on the standard material
    easing.dampC(shirtMaterial.color, snap.color, 0.25, delta);
  });

  return (
    <group 
      ref={meshRef} 
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh
        castShadow
        geometry={nodes.T_Shirt_male.geometry}
        material={shirtMaterial}
        dispose={null}
      >
        <Decal
          position={[0, 0.04, 0.15]}
          rotation={[0, 0, 0]}
          scale={0.15}
          map={logoTexture}
          map-anisotropy={16}
          depthTest={false}
          depthWrite={true}
        />
      </mesh>
    </group>
  );
};

const HeroCanvas = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="w-full h-[400px] md:h-[550px] relative cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 35 }}
        gl={{ preserveDrawingBuffer: true }}
        shadows
        className="w-full h-full"
      >
        {/* Ambient lighting */}
        <ambientLight intensity={0.4} />

        {/* Studio 3-point lighting setup for premium 3D look */}
        {/* 1. Key light: warm and strong from top-front-right */}
        <directionalLight
          position={[3, 6, 4]}
          intensity={1.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
          color="#fff8f0"
        />

        {/* 2. Fill light: soft purple-blue fill from front-left */}
        <directionalLight
          position={[-4, 2, -2]}
          intensity={0.6}
          color="#d0d0ff"
        />

        {/* 3. Rim/Backlight: cyan-blue highlight from back-top-center to separate model from background */}
        <directionalLight
          position={[0, 4, -6]}
          intensity={0.9}
          color="#ffffff"
        />

        {/* 4. Ground Bounce / Floor point light */}
        <pointLight
          position={[0, -2, 2]}
          intensity={0.3}
          color="#8844ff"
        />

        <Suspense fallback={null}>
          <Center>
            <HeroShirt hovered={hovered} setHovered={setHovered} />
          </Center>
        </Suspense>
        
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
      
      {/* Visual indicator for interactive click & drag */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/5 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] text-gray-500 font-medium select-none pointer-events-none border border-black/5 animate-pulse">
        ✦ Click & Drag to Rotate
      </div>
    </div>
  );
};

export default HeroCanvas;
