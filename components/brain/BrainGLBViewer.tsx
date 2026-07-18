"use client";

import { useRef, useState, useCallback, Suspense, useEffect } from "react";
import { Canvas, useLoader, ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

interface RegionLabel {
  ja: string;
  en: string;
  centroid_lh?: [number, number, number];
  centroid_rh?: [number, number, number];
}

// ────────────────────────────────────────────────
// テクスチャ付きスライス面（実際のMRI断面を表示）
// ────────────────────────────────────────────────
function TexturedSlicePlane({
  url,
  position,
  rotation,
  planeWidth,
  planeHeight,
  borderColor,
}: {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  planeWidth: number;
  planeHeight: number;
  borderColor: number;
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!url) return;
    const loader = new THREE.TextureLoader();
    const t = loader.load(url, (loaded) => {
      loaded.minFilter = THREE.LinearFilter;
      loaded.magFilter = THREE.LinearFilter;
      setTexture(loaded);
    });
    return () => {
      setTexture(null);
      t.dispose();
    };
  }, [url]);

  return (
    <group position={position} rotation={rotation}>
      {/* MRI断面テクスチャ */}
      <mesh renderOrder={1}>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshBasicMaterial
          map={texture ?? null}
          transparent
          opacity={texture ? 0.92 : 0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
          alphaTest={0.005}
          color={texture ? 0xffffff : borderColor}
        />
      </mesh>
      {/* 境界線 */}
      <lineSegments renderOrder={2}>
        <edgesGeometry args={[new THREE.PlaneGeometry(planeWidth, planeHeight)]} />
        <lineBasicMaterial color={borderColor} transparent opacity={0.85} />
      </lineSegments>
    </group>
  );
}

// ────────────────────────────────────────────────
// スライス面インジケーター
// GLB座標系: GLB_X=MNI_X, GLB_Y=MNI_Z(superior), GLB_Z=-MNI_Y(posterior=+Z)
// ────────────────────────────────────────────────
interface SlicePlanesProps {
  axialZ: number;
  coronalY: number;
  sagittalX: number;
  axialUrl: string;
  coronalUrl: string;
  sagittalUrl: string;
  showAxial: boolean;
  showCoronal: boolean;
  showSagittal: boolean;
}

function SlicePlanes({
  axialZ, coronalY, sagittalX,
  axialUrl, coronalUrl, sagittalUrl,
  showAxial, showCoronal, showSagittal,
}: SlicePlanesProps) {
  // 脳の GLB空間での中心・サイズ（slice_metadata.json の world_coord range から算出）
  // MNI_X: sagittal range -75.76..76.15 → cx=0.2, W=151.9
  // MNI_Y: coronal range -110.76..77.29 → cz=16.7, D=188.1
  // MNI_Z: axial range -71.76..86.05   → cy=7.1,  H=157.8
  const cx = 0.2;
  const cy = 7.1;
  const cz = 16.7;
  const W = 151.9;  // MNI_X 幅
  const H = 157.8;  // MNI_Z 高さ
  const D = 188.1;  // MNI_Y 奥行き

  return (
    <>
      {/* 軸位断（水平 XZ面） */}
      {showAxial && (
        <TexturedSlicePlane
          url={axialUrl}
          position={[cx, axialZ, cz]}
          rotation={[-Math.PI / 2, 0, 0]}
          planeWidth={W}
          planeHeight={D}
          borderColor={0x00ccff}
        />
      )}
      {/* 冠状断（XY面）*/}
      {showCoronal && (
        <TexturedSlicePlane
          url={coronalUrl}
          position={[cx, cy, -coronalY]}
          rotation={[0, 0, 0]}
          planeWidth={W}
          planeHeight={H}
          borderColor={0x00ff88}
        />
      )}
      {/* 矢状断（YZ面）*/}
      {showSagittal && (
        <TexturedSlicePlane
          url={sagittalUrl}
          position={[sagittalX, cy, cz]}
          rotation={[0, Math.PI / 2, 0]}
          planeWidth={D}
          planeHeight={H}
          borderColor={0xff6644}
        />
      )}
    </>
  );
}

// ────────────────────────────────────────────────
// 脳モデル本体
// ────────────────────────────────────────────────
interface BrainModelProps {
  glbPath: string;
  labelsData: Record<string, RegionLabel>;
  selectedRegion: string | null;
  onRegionSelect: (region: string) => void; // 常に選択（null不可）
  hiddenRegions?: Set<string>;
}

function BrainModel({ glbPath, labelsData, selectedRegion, onRegionSelect, hiddenRegions }: BrainModelProps) {
  const gltf = useLoader(GLTFLoader, glbPath);
  const [hoveredMesh, setHoveredMesh] = useState<string | null>(null);
  const originalMaterials = useRef<Map<string, THREE.MeshStandardMaterial>>(new Map());

  // 初期マテリアル保存
  useEffect(() => {
    if (!gltf.scene) return;
    gltf.scene.traverse((node) => {
      if (node instanceof THREE.Mesh && !originalMaterials.current.has(node.name)) {
        originalMaterials.current.set(node.name, (node.material as THREE.MeshStandardMaterial).clone());
      }
    });
  }, [gltf]);

  // マテリアル・可視性・レイキャスト更新
  useEffect(() => {
    if (!gltf.scene) return;
    gltf.scene.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;

      // 非表示（レイキャストも無効化）
      if (hiddenRegions?.has(node.name)) {
        node.visible = false;
        node.layers.disable(0);
        return;
      }
      node.visible = true;
      node.layers.enable(0);

      const orig = originalMaterials.current.get(node.name);
      if (!orig) return;
      const mat = node.material as THREE.MeshStandardMaterial;
      const isSelected = selectedRegion ? node.name.toLowerCase() === selectedRegion.toLowerCase() : false;
      const isHovered = hoveredMesh ? node.name.toLowerCase() === hoveredMesh.toLowerCase() : false;

      if (isSelected) {
        // 強調表示: 発光 + 完全不透明 + 明るい色
        mat.emissive.set(0xffaa00);
        mat.emissiveIntensity = 1.0;
        mat.color.copy(orig.color).multiplyScalar(1.6);
        mat.opacity = 1.0;
        mat.transparent = false;
      } else if (isHovered) {
        mat.emissive.set(0x4488ff);
        mat.emissiveIntensity = 0.6;
        mat.color.copy(orig.color).multiplyScalar(1.2);
        mat.opacity = 0.95;
        mat.transparent = true;
      } else if (selectedRegion) {
        // 選択中の他領域: ほんの少し暗く
        mat.emissive.set(0x000000);
        mat.emissiveIntensity = 0;
        mat.color.copy(orig.color).multiplyScalar(0.82);
        mat.opacity = 0.72;
        mat.transparent = true;
      } else {
        // 通常
        mat.emissive.set(0x000000);
        mat.emissiveIntensity = 0;
        mat.color.copy(orig.color);
        mat.opacity = 0.88;
        mat.transparent = true;
      }
      mat.needsUpdate = true;
    });
  }, [gltf, selectedRegion, hoveredMesh, hiddenRegions]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      const mesh = e.object as THREE.Mesh;
      const key = findRegionKey(mesh.name, labelsData);
      if (key) onRegionSelect(key); // 同じ領域でも選択維持
    },
    [labelsData, onRegionSelect]
  );

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHoveredMesh((e.object as THREE.Mesh).name);
    document.body.style.cursor = "pointer";
  }, []);

  const handlePointerOut = useCallback(() => {
    setHoveredMesh(null);
    document.body.style.cursor = "auto";
  }, []);

  return (
    <primitive
      object={gltf.scene}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  );
}

function findRegionKey(meshName: string, labelsData: Record<string, RegionLabel>): string | null {
  const name = meshName.toLowerCase();
  for (const key of Object.keys(labelsData)) {
    if (key.toLowerCase() === name) return key;
  }
  return meshName || null;
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[40, 16, 16]} />
      <meshStandardMaterial color="#334455" wireframe />
    </mesh>
  );
}

// ────────────────────────────────────────────────
// メインコンポーネント
// ────────────────────────────────────────────────
export interface BrainGLBViewerProps {
  glbPath: string;
  labelsData: Record<string, RegionLabel>;
  selectedRegion: string | null;
  onRegionSelect: (region: string | null) => void;
  viewMode: "macro" | "detailed";
  sliceMni?: {
    axialZ: number;
    coronalY: number;
    sagittalX: number;
    axialUrl: string;
    coronalUrl: string;
    sagittalUrl: string;
  };
  showAxialPlane?: boolean;
  showCoronalPlane?: boolean;
  showSagittalPlane?: boolean;
  hiddenRegions?: Set<string>;
}

export default function BrainGLBViewer({
  glbPath, labelsData, selectedRegion, onRegionSelect,
  viewMode, sliceMni,
  showAxialPlane = false, showCoronalPlane = false, showSagittalPlane = false,
  hiddenRegions,
}: BrainGLBViewerProps) {
  // 背景クリックでは選択解除しない（ボタン専用）
  return (
    <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
      <Canvas
        camera={{ position: [120, 60, 180], fov: 40, near: 1, far: 2000, up: [0, 1, 0] }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "linear-gradient(160deg, #080c14 0%, #121928 100%)" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[150, 200, 100]} intensity={1.1} />
        <directionalLight position={[-100, 50, -80]} intensity={0.5} />
        <pointLight position={[0, 120, 0]} intensity={0.4} />

        <Suspense fallback={<LoadingFallback />}>
          <BrainModel
            glbPath={glbPath}
            labelsData={labelsData}
            selectedRegion={selectedRegion}
            onRegionSelect={(key) => onRegionSelect(key)}
            hiddenRegions={hiddenRegions}
          />
          {sliceMni && (showAxialPlane || showCoronalPlane || showSagittalPlane) && (
            <SlicePlanes
              axialZ={sliceMni.axialZ}
              coronalY={sliceMni.coronalY}
              sagittalX={sliceMni.sagittalX}
              axialUrl={sliceMni.axialUrl}
              coronalUrl={sliceMni.coronalUrl}
              sagittalUrl={sliceMni.sagittalUrl}
              showAxial={showAxialPlane}
              showCoronal={showCoronalPlane}
              showSagittal={showSagittalPlane}
            />
          )}
        </Suspense>

        <OrbitControls
          target={[0, 7, 18]}
          enablePan enableZoom enableRotate
          enableDamping dampingFactor={0.08}
          rotateSpeed={0.8} zoomSpeed={1.2} panSpeed={0.8}
          autoRotate={false}
          minPolarAngle={0} maxPolarAngle={Math.PI}
        />
      </Canvas>

      {/* 操作ガイド */}
      <div className="absolute bottom-2 left-2 text-[10px] text-white/35 pointer-events-none leading-relaxed">
        <p>ドラッグ: 回転　右ドラッグ/2本指: 移動　スクロール: ズーム</p>
      </div>
    </div>
  );
}
