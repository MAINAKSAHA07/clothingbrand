import React, { Suspense, useRef, useEffect, useLayoutEffect, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Center, useGLTF, useTexture, Decal, OrbitControls, ContactShadows } from '@react-three/drei';
import AnnyFigure, {
  SHOWCASE_GENDERS,
  SHOWCASE_BODY_TYPES,
  resolveShowcaseFigure,
} from './AnnyFigure';
import { IconMinus, IconPlus, IconRefresh } from '@tabler/icons-react';
import * as THREE from 'three';
import { useSnapshot } from 'valtio';
import { easing } from 'maath';
import state from '../store';


// --- SPIN COMPONENT (PANEL A) ---
const SpinShirt = () => {
  const snap = useSnapshot(state);
  const meshRef = useRef();
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

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.45;
    }
    // Smoothly transition colors
    easing.dampC(shirtMaterial.color, snap.color, 0.25, delta);
  });

  return (
    <group ref={meshRef}>
      <mesh
        castShadow
        geometry={nodes.T_Shirt_male.geometry}
        material={shirtMaterial}
        dispose={null}
        scale={0.8}
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

const WALK_ZOOM_MIN = 0.55;
const WALK_ZOOM_MAX = 1.5;
const WALK_ZOOM_DEFAULT = 0.82;
const WALK_ZOOM_STEP = 0.1;

const measureWalkBody = (bodyRoot) => {
  bodyRoot.updateMatrixWorld(true);
  return new THREE.Box3().setFromObject(bodyRoot).getSize(new THREE.Vector3());
};

const fitWalkCamera = (camera, controls, size, zoomFactor = WALK_ZOOM_DEFAULT) => {
  const maxDim = Math.max(size.x, size.y, size.z);
  const fovRadians = (camera.fov * Math.PI) / 180;
  const fitDistance = (maxDim / (2 * Math.tan(fovRadians / 2))) * 1.12 * zoomFactor;

  camera.fov = 38;
  camera.position.set(0, 0, fitDistance);
  camera.near = Math.max(0.01, fitDistance / 100);
  camera.far = fitDistance * 20;
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();

  if (controls) {
    controls.target.set(0, 0, 0);
    controls.object.position.copy(camera.position);
    controls.minDistance = fitDistance * WALK_ZOOM_MIN;
    controls.maxDistance = fitDistance * WALK_ZOOM_MAX;
    controls.update();
  }

  return fitDistance;
};


const WalkView = ({ zoomFactor, controlsRef, figureId }) => {
  const bodyRef = useRef();
  const modelSizeRef = useRef(null);
  const [fitVersion, setFitVersion] = useState(0);
  const { camera, size } = useThree();

  const handleFitReady = useCallback(() => {
    modelSizeRef.current = null;
    setFitVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    modelSizeRef.current = null;
  }, [figureId]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (!bodyRef.current) return;

      if (!modelSizeRef.current) {
        modelSizeRef.current = measureWalkBody(bodyRef.current);
      }

      fitWalkCamera(camera, controlsRef.current, modelSizeRef.current, zoomFactor);
    });

    return () => cancelAnimationFrame(frame);
  }, [camera, controlsRef, zoomFactor, figureId, size.width, size.height, fitVersion]);

  return (
    <AnnyFigure
      figureId={figureId}
      bodyRef={bodyRef}
      onFitReady={handleFitReady}
    />
  );
};

const WalkSceneBackground = () => {
  const { scene } = useThree();

  useLayoutEffect(() => {
    const previous = scene.background;
    scene.background = new THREE.Color('#4a5168');
    return () => {
      scene.background = previous;
    };
  }, [scene]);

  return null;
};

const ShowcaseCamera = ({ mode }) => {
  const { camera } = useThree();

  useLayoutEffect(() => {
    if (mode === 'walk') return;
    camera.position.set(0, 0.1, 2.0);
    camera.fov = 35;
    camera.lookAt(0, 0.05, 0);
    camera.updateProjectionMatrix();
  }, [camera, mode]);

  return null;
};

// --- FABRIC FLOW / CLOTH PHYSICS COMPONENT (PANEL C) ---
const FabricShirt = () => {
  const snap = useSnapshot(state);
  const { nodes, materials } = useGLTF('/shirt.glb');
  const logoTexture = useTexture(snap.frontLogoDecal);

  // Clone material to avoid modifying standard material in other components
  const clothMaterial = materials.lambert1.clone();
  clothMaterial.color.setStyle(snap.color);
  clothMaterial.roughness = 0.8;
  clothMaterial.metalness = 0.0;

  const uTime = useRef({ value: 0 });

  clothMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime.current;

    shader.vertexShader = `
      uniform float uTime;
    ` + shader.vertexShader;

    // Inject wind wave formulas inside the vertex shader
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      float speed = uTime * 4.5;
      
      // Calculate wave noise using position coordinates
      float waveX = sin(position.y * 6.5 + speed) * cos(position.x * 5.5 + speed * 0.7) * 0.07;
      float waveZ = cos(position.y * 5.0 - speed * 1.2) * sin(position.z * 4.0 + speed * 0.8) * 0.06;
      float waveY = sin(position.x * 4.0 + speed * 0.9) * 0.02;

      // Restrict waves on shoulders so the top stays hung
      float scaleFactor = smoothstep(-0.4, -0.1, position.y);
      
      transformed.x += waveX * scaleFactor;
      transformed.y += waveY * scaleFactor;
      transformed.z += waveZ * scaleFactor;
      `
    );
  };

  useFrame((state, delta) => {
    uTime.current.value += delta;
  });

  return (
    <group position={[0, 0.05, 0]}>
      <mesh
        castShadow
        geometry={nodes.T_Shirt_male.geometry}
        material={clothMaterial}
        dispose={null}
        scale={0.8}
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
      
      {/* Decorative hanger thread line to make it look hung in mid-air */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 0.6, 8]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
    </group>
  );
};

// --- SHOWCASE CANVAS MAIN CONTROLLER ---
const ShowcaseCanvas = ({ mode, shutterOpen }) => {
  const slats = Array.from({ length: 24 });
  const controlsRef = useRef();
  const [walkZoom, setWalkZoom] = useState(WALK_ZOOM_DEFAULT);
  const [walkGender, setWalkGender] = useState('men');
  const [walkBodyType, setWalkBodyType] = useState('average');
  const activeFigure = resolveShowcaseFigure(walkGender, walkBodyType).id;

  const zoomOut = useCallback(() => {
    setWalkZoom((z) => Math.min(WALK_ZOOM_MAX, z + WALK_ZOOM_STEP));
  }, []);

  const zoomIn = useCallback(() => {
    setWalkZoom((z) => Math.max(WALK_ZOOM_MIN, z - WALK_ZOOM_STEP));
  }, []);

  const resetZoom = useCallback(() => {
    setWalkZoom(WALK_ZOOM_DEFAULT);
  }, []);

  useEffect(() => {
    if (mode === 'walk') {
      setWalkZoom(WALK_ZOOM_DEFAULT);
    }
  }, [mode]);

  return (
    <div className="w-full h-full min-h-[300px] md:min-h-[400px] relative rounded-2xl bg-black/40 backdrop-blur-md overflow-hidden border border-white/10 shadow-2xl">
      <Canvas
        camera={{ position: [0, 0.1, 2.0], fov: 35 }}
        gl={{ preserveDrawingBuffer: true }}
        shadows
        className="w-full h-full"
      >
        {/* Ambient lighting */}
        <ambientLight intensity={mode === 'walk' ? 0.55 : 0.3} />

        {/* Studio 3-point lighting setup */}
        {/* 1. Key light */}
        <directionalLight
          position={[3, 8, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
          color="#ffffff"
        />

        {/* 2. Fill light (soft purple tone for brand look) */}
        <directionalLight
          position={[-4, 2, -3]}
          intensity={0.6}
          color="#c4b5fd"
        />

        {/* 3. Rim/Backlight (cyan-blue highlight separator) */}
        <directionalLight
          position={[0, 3, -6]}
          intensity={0.9}
          color="#818cf8"
        />

        <ShowcaseCamera mode={mode} />
        {mode === 'walk' && <WalkSceneBackground />}

        <Suspense fallback={null}>
          {mode === 'walk' ? (
            <WalkView
              zoomFactor={walkZoom}
              controlsRef={controlsRef}
              figureId={activeFigure}
            />
          ) : (
            <Center>
              {mode === 'spin' && <SpinShirt />}
              {mode === 'wind' && <FabricShirt />}
            </Center>
          )}
        </Suspense>

        {/* Contact Shadow for ground depth */}
        <ContactShadows
          position={[0, mode === 'walk' ? -0.84 : -0.9, 0]}
          opacity={mode === 'walk' ? 0.55 : 0.4}
          scale={4}
          blur={2.2}
          far={3}
          color="#1a1a22"
        />

        <OrbitControls
          ref={controlsRef}
          key={mode}
          target={mode === 'walk' ? [0, 0, 0] : [0, 0.05, 0]}
          enableZoom={mode === 'walk'}
          enablePan={false}
          zoomSpeed={0.8}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>

      {/* ── METALLIC INDUSTRIAL SHUTTER OVERLAY ────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-30">
        
        {/* Shutter Top Housing (Header) */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#3a3a3a] via-[#484848] to-[#2b2b2b] border-b-2 border-black/40 shadow-[0_4px_10px_rgba(0,0,0,0.6)] flex items-center justify-center pointer-events-auto z-40">
          {/* Industrial rivets on header */}
          <div className="absolute left-4 w-1.5 h-1.5 rounded-full bg-black/40 border border-white/5" />
          <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-black/40 border border-white/5" />
          <span className="text-[8px] font-mono tracking-[0.25em] text-[#888] font-bold select-none uppercase">
            STITCH3D SHOWCASE DOCK
          </span>
        </div>

        {/* Left Vertical Guide Rail */}
        <div className="absolute top-10 bottom-0 left-0 w-3 bg-gradient-to-r from-[#1b1b1b] via-[#333] to-[#141414] border-r border-black/60 shadow-[2px_0_5px_rgba(0,0,0,0.5)] z-30 pointer-events-auto" />

        {/* Right Vertical Guide Rail */}
        <div className="absolute top-10 bottom-0 right-0 w-3 bg-gradient-to-r from-[#141414] via-[#333] to-[#1b1b1b] border-l border-black/60 shadow-[-2px_0_5px_rgba(0,0,0,0.5)] z-30 pointer-events-auto" />

        {/* Roll-up Shutter Slats Area */}
        <div className="absolute top-10 bottom-0 left-3 right-3 overflow-hidden z-20">
          <div 
            className="w-full flex flex-col pointer-events-auto"
            style={{
              height: '100%',
              transform: shutterOpen ? 'translateY(-105%)' : 'translateY(0%)',
              transition: 'transform 1.4s cubic-bezier(0.77, 0, 0.175, 1)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.8)',
            }}
          >
            {slats.map((_, i) => (
              <div 
                key={i}
                className="w-full flex-shrink-0"
                style={{
                  height: '20px',
                  background: 'linear-gradient(180deg, #2a2a2a 0%, #555 20%, #666 35%, #383838 65%, #1f1f1f 90%, #151515 100%)',
                  borderBottom: '1px solid #111',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 3px rgba(0,0,0,0.35)',
                  position: 'relative',
                }}
              >
                {/* Horizontal grooved line detail */}
                <div style={{
                  position: 'absolute',
                  top: '45%',
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'rgba(0,0,0,0.35)',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                }} />
              </div>
            ))}

            {/* Bottom heavy handle bar */}
            <div 
              style={{
                width: '100%',
                height: '24px',
                background: 'linear-gradient(180deg, #4c4c4c 0%, #1c1c1c 100%)',
                borderTop: '2px solid #5a5a5a',
                borderBottom: '4px solid #0f0f0f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.7)',
                flexShrink: 0,
              }}
            >
              <div style={{
                width: '50px',
                height: '5px',
                background: '#0a0a0a',
                borderRadius: '3px',
                border: '1px solid #333',
              }} />
            </div>
            
            {/* Fill remainder of door if height exceeds slats count */}
            <div style={{
              flex: 1,
              background: '#151515',
            }} />
          </div>
        </div>

      </div>

      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      } />
      
      <div className="absolute bottom-3 right-3 bg-white/5 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-[9px] text-white/50 pointer-events-none font-mono z-10">
        {mode === 'spin' && '360° SPIN & INSPECT'}
        {mode === 'walk' && 'ANNY BODY FIT'}
        {mode === 'wind' && 'CLOTH PHYSICS SIM'}
      </div>

      {mode === 'walk' && (
        <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-2 pointer-events-auto">
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg p-1">
            {SHOWCASE_GENDERS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setWalkGender(option.id)}
                className={`px-2 py-1 rounded text-[9px] font-mono transition-colors ${
                  walkGender === option.id
                    ? 'bg-white/15 text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg p-1">
            {SHOWCASE_BODY_TYPES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setWalkBodyType(option.id)}
                className={`px-2 py-1 rounded text-[9px] font-mono transition-colors ${
                  walkBodyType === option.id
                    ? 'bg-white/15 text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-black/50 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={zoomOut}
              disabled={walkZoom >= WALK_ZOOM_MAX}
              aria-label="Zoom out"
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <IconMinus size={14} stroke={2} />
            </button>
            <span className="px-2 text-[9px] font-mono text-white/40 border-x border-white/10 select-none">
              ZOOM
            </span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={walkZoom <= WALK_ZOOM_MIN}
              aria-label="Zoom in"
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <IconPlus size={14} stroke={2} />
            </button>
          </div>
          <button
            type="button"
            onClick={resetZoom}
            aria-label="Reset zoom"
            className="p-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <IconRefresh size={14} stroke={2} />
          </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowcaseCanvas;
