import React, { useRef, useMemo, useState, useLayoutEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Decal } from '@react-three/drei';
import { useSnapshot } from 'valtio';
import { easing } from 'maath';
import * as THREE from 'three';
import state from '../store';

/**
 * Full Anny model library (29 bodies). Only a 6-combo subset is exposed in the UI.
 * GLBs live in public/models/anny/ — generated via scripts/export_anny_glb.py or Colab.
 */
export const ANNY_MODEL_CATALOG = {
  'adult-neutral': '/models/anny/adult-neutral.glb',
  'athletic-male': '/models/anny/athletic-male.glb',
  'young-female': '/models/anny/young-female.glb',
  'man-average': '/models/anny/man-average.glb',
  'man-tall-lean': '/models/anny/man-tall-lean.glb',
  'man-short-stocky': '/models/anny/man-short-stocky.glb',
  'man-heavy': '/models/anny/man-heavy.glb',
  'man-muscular': '/models/anny/man-muscular.glb',
  'man-senior-60plus': '/models/anny/man-senior-60plus.glb',
  'man-senior-70plus': '/models/anny/man-senior-70plus.glb',
  'woman-average': '/models/anny/woman-average.glb',
  'woman-tall-lean': '/models/anny/woman-tall-lean.glb',
  'woman-petite': '/models/anny/woman-petite.glb',
  'woman-curvy': '/models/anny/woman-curvy.glb',
  'woman-athletic': '/models/anny/woman-athletic.glb',
  'woman-senior-60plus': '/models/anny/woman-senior-60plus.glb',
  'woman-senior-70plus': '/models/anny/woman-senior-70plus.glb',
  'child-boy-8': '/models/anny/child-boy-8.glb',
  'child-girl-8': '/models/anny/child-girl-8.glb',
  'child-boy-12': '/models/anny/child-boy-12.glb',
  'child-girl-12': '/models/anny/child-girl-12.glb',
  'teen-boy': '/models/anny/teen-boy.glb',
  'teen-girl': '/models/anny/teen-girl.glb',
  'adult-short-light': '/models/anny/adult-short-light.glb',
  'adult-short-heavy': '/models/anny/adult-short-heavy.glb',
  'adult-tall-light': '/models/anny/adult-tall-light.glb',
  'adult-tall-heavy': '/models/anny/adult-tall-heavy.glb',
  'adult-average-light': '/models/anny/adult-average-light.glb',
  'adult-average-heavy': '/models/anny/adult-average-heavy.glb',
};

export const SHOWCASE_GENDERS = [
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
];

export const SHOWCASE_BODY_TYPES = [
  { id: 'average', label: 'Average' },
  { id: 'athletic', label: 'Athletic' },
  { id: 'plus', label: 'Plus' },
];

/** Maps gender × body type → catalog model id (6 visible combos). */
export const SHOWCASE_FIGURE_MAP = {
  men: {
    average: 'man-average',
    athletic: 'athletic-male',
    plus: 'man-heavy',
  },
  women: {
    average: 'woman-average',
    athletic: 'woman-athletic',
    plus: 'woman-curvy',
  },
};

export const resolveShowcaseFigure = (gender, bodyType) => {
  const modelId =
    SHOWCASE_FIGURE_MAP[gender]?.[bodyType] ??
    SHOWCASE_FIGURE_MAP.men.average;
  return {
    id: modelId,
    model: ANNY_MODEL_CATALOG[modelId],
  };
};

/** Preload only the 6 bodies shown in the showcase picker. */
export const SHOWCASE_MODEL_IDS = [
  ...new Set(
    Object.values(SHOWCASE_FIGURE_MAP).flatMap((row) => Object.values(row))
  ),
];

const _v = new THREE.Vector3();
const _shirtBox = new THREE.Box3();
const _shirtCenter = new THREE.Vector3();

const DEFAULT_SHIRT_FIT = {
  scale: 0.82,
  position: [0, 0.2, 0.08],
  decalScale: 0.15,
};

/** Align shirt to torso using body vertex samples (works for all catalog sizes). */
export function computeShirtFit(bodyRoot, shirtGeometry) {
  if (!bodyRoot || !shirtGeometry) return DEFAULT_SHIRT_FIT;

  bodyRoot.updateMatrixWorld(true);

  const vertices = [];
  bodyRoot.traverse((child) => {
    if (!child.isMesh) return;
    const positions = child.geometry.attributes.position;
    for (let i = 0; i < positions.count; i += 1) {
      _v.fromBufferAttribute(positions, i);
      _v.applyMatrix4(child.matrixWorld);
      vertices.push(_v.x, _v.y, _v.z);
    }
  });

  if (vertices.length === 0) {
    return { scale: 0.75, position: [0, 0.13, 0.1], decalScale: 0.14 };
  }

  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 1; i < vertices.length; i += 3) {
    minY = Math.min(minY, vertices[i]);
    maxY = Math.max(maxY, vertices[i]);
  }

  const height = maxY - minY;
  // Shoulder/chest band (76–86%) — used to size and position the shirt at the shoulders.
  const bandLo = minY + height * 0.76;
  const bandHi = minY + height * 0.86;
  const coreLimit = height * 0.18;

  let coreCount = 0;
  let bandCount = 0;
  let coreMinX = Infinity;
  let coreMaxX = -Infinity;
  let coreMaxZ = -Infinity;
  let coreCx = 0;

  let bandMinX = Infinity;
  let bandMaxX = -Infinity;
  let bandMaxZ = -Infinity;
  let bandCx = 0;

  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];
    const z = vertices[i + 2];

    if (y < bandLo || y > bandHi) continue;

    bandCount += 1;
    bandMinX = Math.min(bandMinX, x);
    bandMaxX = Math.max(bandMaxX, x);
    bandMaxZ = Math.max(bandMaxZ, z);
    bandCx += x;

    if (Math.abs(x) > coreLimit) continue;

    coreCount += 1;
    coreMinX = Math.min(coreMinX, x);
    coreMaxX = Math.max(coreMaxX, x);
    coreMaxZ = Math.max(coreMaxZ, z);
    coreCx += x;
  }

  const useCore = coreCount >= 50;
  const count = useCore ? coreCount : bandCount;
  let shoulderWidth = useCore ? coreMaxX - coreMinX : bandMaxX - bandMinX;
  let cx = count > 0 ? (useCore ? coreCx : bandCx) / count : 0;
  let frontZ = ((useCore ? coreMaxZ : bandMaxZ) || 0) + 0.015;

  // Fallback if torso band is empty (shouldn't happen, but prevents NaN / invisible shirt).
  if (!Number.isFinite(shoulderWidth) || shoulderWidth <= 0.01 || count === 0) {
    let fallbackMinX = Infinity;
    let fallbackMaxX = -Infinity;
    let fallbackMaxZ = -Infinity;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];
      if (y < minY + height * 0.45 || y > minY + height * 0.78) continue;
      fallbackMinX = Math.min(fallbackMinX, x);
      fallbackMaxX = Math.max(fallbackMaxX, x);
      fallbackMaxZ = Math.max(fallbackMaxZ, z);
    }
    shoulderWidth = Math.max(0.2, fallbackMaxX - fallbackMinX);
    frontZ = (Number.isFinite(fallbackMaxZ) ? fallbackMaxZ : 0.1) + 0.015;
  }

  shirtGeometry.computeBoundingBox();
  if (!_shirtBox.isEmpty()) {
    _shirtBox.copy(shirtGeometry.boundingBox);
  } else {
    return DEFAULT_SHIRT_FIT;
  }
  _shirtBox.getCenter(_shirtCenter);

  const shirtWidth = Math.max(0.01, _shirtBox.max.x - _shirtBox.min.x);
  const scale = Math.max(0.4, (shoulderWidth / shirtWidth) * 1.35);

  // Align shirt neckline/collar to shoulder height (~88% from feet).
  const collarY = minY + height * 0.88;

  return {
    scale,
    position: [
      cx - _shirtCenter.x * scale,
      collarY - _shirtBox.max.y * scale,
      frontZ - _shirtBox.max.z * scale,
    ],
    decalScale: (0.15 * scale) / 0.8,
  };
}

const WornShirt = ({ shirtConfig }) => {
  const snap = useSnapshot(state);
  const { nodes } = useGLTF('/shirt.glb');
  const logoTexture = useTexture(snap.frontLogoDecal);

  const shirtMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(snap.color),
        roughness: 0.8,
        metalness: 0.1,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
    []
  );

  useFrame((_, delta) => {
    easing.dampC(shirtMaterial.color, snap.color, 0.25, delta);
  });

  const { scale, position, decalScale } = shirtConfig ?? DEFAULT_SHIRT_FIT;

  return (
    <mesh
      castShadow
      geometry={nodes.T_Shirt_male.geometry}
      material={shirtMaterial}
      scale={scale}
      position={position}
      renderOrder={2}
    >
      <Decal
        position={[0, 0.04, 0.15]}
        rotation={[0, 0, 0]}
        scale={decalScale}
        map={logoTexture}
        depthTest={false}
        depthWrite
      />
    </mesh>
  );
};

const AnnyBody = ({ modelPath, onReady }) => {
  const { scene } = useGLTF(modelPath);

  const bodyScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#c8ced9',
          metalness: 0.08,
          roughness: 0.45,
          transparent: true,
          opacity: 0.88,
          emissive: '#3a4255',
          emissiveIntensity: 0.35,
        });
        child.castShadow = true;
        child.receiveShadow = true;
        child.renderOrder = 1;
      }
    });

    const box = new THREE.Box3().setFromObject(clone);
    clone.position.sub(box.getCenter(new THREE.Vector3()));
    clone.updateMatrixWorld(true);

    return clone;
  }, [scene]);

  useLayoutEffect(() => {
    onReady?.(bodyScene);
  }, [bodyScene, onReady]);

  return <primitive object={bodyScene} />;
};

const AnnyFigure = ({ figureId = 'man-average', bodyRef, onFitReady }) => {
  const groupRef = useRef();
  const bodySceneRef = useRef(null);
  const [fitVersion, setFitVersion] = useState(0);
  const { nodes } = useGLTF('/shirt.glb');

  const modelPath = ANNY_MODEL_CATALOG[figureId] ?? ANNY_MODEL_CATALOG['man-average'];
  const shirtGeometry = nodes.T_Shirt_male.geometry;

  const shirtFit = useMemo(() => {
    if (!bodySceneRef.current) return DEFAULT_SHIRT_FIT;
    return computeShirtFit(bodySceneRef.current, shirtGeometry);
  }, [figureId, fitVersion, shirtGeometry]);

  const handleBodyReady = useCallback(
    (bodyScene) => {
      bodySceneRef.current = bodyScene;
      if (bodyRef) bodyRef.current = bodyScene;
      setFitVersion((v) => v + 1);
      onFitReady?.();
    },
    [bodyRef, onFitReady]
  );

  useLayoutEffect(() => {
    bodySceneRef.current = null;
    setFitVersion((v) => v + 1);
  }, [figureId]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.15;
  });

  return (
    <group ref={groupRef}>
      <AnnyBody key={figureId} modelPath={modelPath} onReady={handleBodyReady} />
      <WornShirt shirtConfig={shirtFit} />
    </group>
  );
};

SHOWCASE_MODEL_IDS.forEach((id) => {
  const path = ANNY_MODEL_CATALOG[id];
  if (path) useGLTF.preload(path);
});
useGLTF.preload('/shirt.glb');

export default AnnyFigure;
