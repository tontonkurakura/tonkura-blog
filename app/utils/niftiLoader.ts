import * as nifti from "nifti-reader-js";
import * as pako from "pako";
import * as THREE from "three";

export interface NiftiVolume {
  header: any;
  image: any;
  dimensions: number[];
  spacing: number[];
  min: number;
  max: number;
  data: Float32Array;
}

/**
 * NIfTIファイルを読み込む関数
 * @param url NIfTIファイルのURL
 * @returns Promise<NiftiVolume>
 */
export async function loadNiftiVolume(url: string): Promise<NiftiVolume> {
  try {
    // ファイルを取得
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    // ArrayBufferとして読み込み
    const buffer = await response.arrayBuffer();

    // .nii.gzファイルの場合は解凍
    let data;
    if (url.endsWith(".nii.gz")) {
      try {
        // gzipデータを解凍
        const compressedData = new Uint8Array(buffer);
        data = pako.inflate(compressedData).buffer;
      } catch (error) {
        console.error("Error inflating gzip data:", error);
        throw new Error(`Failed to decompress .nii.gz file: ${error.message}`);
      }
    } else {
      data = buffer;
    }

    // NIfTIヘッダーを解析
    if (!nifti.isNIFTI(data)) {
      throw new Error("Not a valid NIFTI file");
    }

    const header = nifti.readHeader(data);
    const image = nifti.readImage(header, data);

    // 次元情報を取得
    const dimensions = [header.dims[1], header.dims[2], header.dims[3]];

    // ボクセルサイズを取得
    const spacing = [header.pixDims[1], header.pixDims[2], header.pixDims[3]];

    // データをFloat32Arrayに変換
    const typedData = new Float32Array(image);

    // 最小値と最大値を計算
    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < typedData.length; i++) {
      const value = typedData[i];
      if (value > 0) {
        // 0より大きい値のみを考慮（脳領域）
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }

    return {
      header,
      image,
      dimensions,
      spacing,
      min,
      max,
      data: typedData,
    };
  } catch (error) {
    console.error("Error loading NIFTI file:", error);
    throw error;
  }
}

/**
 * NIfTIボリュームからメッシュを生成する関数
 * @param volume NiftiVolume
 * @param threshold しきい値（この値以上のボクセルを表示）
 * @returns THREE.Mesh
 */
export function createMeshFromNiftiVolume(
  volume: NiftiVolume,
  threshold: number = 0
): THREE.Mesh {
  const { dimensions, spacing, data } = volume;

  // マーチングキューブのためのグリッドサイズ
  const gridSize = dimensions;

  // ボクセルデータを3次元配列に変換
  const grid: number[][][] = Array(gridSize[0])
    .fill(0)
    .map(() =>
      Array(gridSize[1])
        .fill(0)
        .map(() => Array(gridSize[2]).fill(0))
    );

  // データを3次元グリッドに配置
  for (let i = 0; i < gridSize[0]; i++) {
    for (let j = 0; j < gridSize[1]; j++) {
      for (let k = 0; k < gridSize[2]; k++) {
        const index = i + j * gridSize[0] + k * gridSize[0] * gridSize[1];
        grid[i][j][k] = data[index];
      }
    }
  }

  // 頂点と面を格納する配列
  const vertices: number[] = [];
  const faces: number[] = [];

  // 簡易的なマーチングキューブアルゴリズム
  // 実際の実装ではThree.jsのMarchingCubesHelperなどを使用するとよい
  for (let i = 0; i < gridSize[0] - 1; i++) {
    for (let j = 0; j < gridSize[1] - 1; j++) {
      for (let k = 0; k < gridSize[2] - 1; k++) {
        const value = grid[i][j][k];

        // しきい値以上の場合、頂点を追加
        if (value >= threshold) {
          // 頂点の位置を計算（ボクセルの中心）
          const x = (i - gridSize[0] / 2) * spacing[0];
          const y = (j - gridSize[1] / 2) * spacing[1];
          const z = (k - gridSize[2] / 2) * spacing[2];

          // 頂点を追加
          vertices.push(x, y, z);

          // 面を追加（単純な立方体として）
          // 実際の実装ではもっと複雑になる
          if (
            i < gridSize[0] - 2 &&
            j < gridSize[1] - 2 &&
            k < gridSize[2] - 2
          ) {
            const vertexIndex = vertices.length / 3 - 1;
            faces.push(vertexIndex, vertexIndex + 1, vertexIndex + 2);
          }
        }
      }
    }
  }

  // ジオメトリを作成
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setIndex(faces);
  geometry.computeVertexNormals();

  // マテリアルを作成
  const material = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0,
    transparent: true,
    opacity: 0.9,
    wireframe: false,
  });

  // メッシュを作成
  return new THREE.Mesh(geometry, material);
}

/**
 * NIfTIボリュームから等値面メッシュを生成する関数（MarchingCubesを使用）
 * @param volume NiftiVolume
 * @param threshold しきい値
 * @returns THREE.Mesh
 */
export function createIsoSurfaceMesh(
  volume: NiftiVolume,
  threshold: number = 0.5
): THREE.Mesh {
  // 注: 実際の実装ではThree.jsのMarchingCubesHelperを使用するとよい
  // このサンプルでは簡易的な実装を示す

  // 球体で代用（実際の実装ではMarchingCubesを使用）
  const geometry = new THREE.SphereGeometry(50, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0,
    transparent: true,
    opacity: 0.9,
    wireframe: false,
  });

  return new THREE.Mesh(geometry, material);
}

/**
 * 脳領域の座標データ
 * MNI152空間における主要な脳領域の座標（x, y, z）
 */
export const brainRegionCoordinates = {
  // 大脳皮質
  frontal_lobe: {
    x: 0,
    y: 40,
    z: 20,
    name: "前頭葉",
    function: "思考、計画、運動制御、感情調節など",
  },
  parietal_lobe: {
    x: 0,
    y: -40,
    z: 50,
    name: "頭頂葉",
    function: "感覚情報の処理、空間認識など",
  },
  temporal_lobe: {
    x: 50,
    y: 0,
    z: -15,
    name: "側頭葉",
    function: "聴覚処理、言語理解、記憶など",
  },
  occipital_lobe: {
    x: 0,
    y: -80,
    z: 10,
    name: "後頭葉",
    function: "視覚情報の処理",
  },

  // 皮質下構造
  hippocampus: {
    x: 30,
    y: -20,
    z: -15,
    name: "海馬",
    function: "記憶の形成と保存",
  },
  amygdala: {
    x: 25,
    y: -5,
    z: -20,
    name: "扁桃体",
    function: "感情処理、特に恐怖反応",
  },
  thalamus: {
    x: 10,
    y: -20,
    z: 5,
    name: "視床",
    function: "感覚情報の中継と統合",
  },
  hypothalamus: {
    x: 5,
    y: 0,
    z: -10,
    name: "視床下部",
    function: "ホルモン調節、体温調節、食欲など",
  },
  caudate: {
    x: 15,
    y: 10,
    z: 10,
    name: "尾状核",
    function: "運動制御、学習、記憶",
  },
  putamen: { x: 25, y: 0, z: 0, name: "被殻", function: "運動制御、学習" },
  globus_pallidus: { x: 20, y: 0, z: -5, name: "淡蒼球", function: "運動制御" },

  // 脳幹と小脳
  cerebellum: {
    x: 0,
    y: -60,
    z: -30,
    name: "小脳",
    function: "運動の協調、バランス、姿勢の維持",
  },
  brainstem: {
    x: 0,
    y: -30,
    z: -25,
    name: "脳幹",
    function: "呼吸、心拍、覚醒など生命維持機能",
  },

  // 機能的領域
  broca_area: {
    x: -45,
    y: 20,
    z: 0,
    name: "ブローカ野",
    function: "言語産生、文法処理",
  },
  wernicke_area: {
    x: -55,
    y: -40,
    z: 5,
    name: "ウェルニッケ野",
    function: "言語理解",
  },
  primary_motor_cortex: {
    x: 0,
    y: -20,
    z: 60,
    name: "一次運動野",
    function: "随意運動の制御",
  },
  primary_sensory_cortex: {
    x: 0,
    y: -30,
    z: 60,
    name: "一次体性感覚野",
    function: "触覚、温度、痛みなどの感覚処理",
  },
  primary_visual_cortex: {
    x: 0,
    y: -90,
    z: 0,
    name: "一次視覚野",
    function: "視覚情報の初期処理",
  },
  primary_auditory_cortex: {
    x: 50,
    y: -20,
    z: 5,
    name: "一次聴覚野",
    function: "聴覚情報の初期処理",
  },
};
