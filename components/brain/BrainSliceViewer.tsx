"use client";

import { useEffect, useRef, useState } from 'react';
import { loadNiftiFile } from '@/utils/niftiUtils';

// NIFTIデータの型定義
interface NiftiData {
  dims: number[];
  pixDims: number[];
  datatypeCode: number;
  typedImage: Uint8Array | Int16Array | Uint16Array | Int32Array | Float32Array | Float64Array;
  image?: ArrayBuffer;
  voxOffset?: number;
  qformCode?: number;
  sformCode?: number;
  xyzt_units?: number;
  affine?: number[][];
  srow_x?: number[];
  srow_y?: number[];
  srow_z?: number[];
}

interface AALJapaneseLabel {
  englishLabel: string;
  japaneseLabel: string;
  laterality: string;
  category: string;
}

interface BrainSliceViewerProps {
  mniUrl: string;
  aalUrl: string;
  aalLabels: { index: number; name: string; color: string }[];
  selectedRegion: number | null;
  sliceType: 'axial' | 'coronal' | 'sagittal';
  sliceIndex?: number;
  onRegionClick: (regionIndex: number) => void;
  showAAL?: boolean;
  japaneseLabelsData?: AALJapaneseLabel[];
}

export default function BrainSliceViewer({
  mniUrl,
  aalUrl,
  aalLabels,
  selectedRegion,
  sliceType,
  sliceIndex,
  onRegionClick,
  showAAL = true,
  // japaneseLabelsDataはpropsとして受け取っているが使用されていないため、コメントアウト
  // japaneseLabelsData = []
}: BrainSliceViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<[number, number, number]>([0, 0, 0]);
  const [currentSliceIndex, setCurrentSliceIndex] = useState<number>(0);
  // mniDataは実際に使用されているため削除しない（transformMniToAalCoordinatesで使用）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mniData, setMniData] = useState<NiftiData | null>(null);
  const [mniVolume, setMniVolume] = useState<Uint8Array | Int16Array | Uint16Array | Int32Array | Float32Array | Float64Array | null>(null);
  const [aalData, setAalData] = useState<NiftiData | null>(null);
  const [aalVolume, setAalVolume] = useState<Uint8Array | Int16Array | Uint16Array | Int32Array | Float32Array | Float64Array | null>(null);
  const [maxIntensity, setMaxIntensity] = useState<number>(255);
  const [cursorPosition, setCursorPosition] = useState<{ voxel: [number, number, number]; mni: [number, number, number] } | null>(null);
  // mniToAalTransformは実際に使用されているため削除しない（transformMniToAalCoordinatesで使用）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mniToAalTransform, setMniToAalTransform] = useState<number[][]>([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);

  // データの読み込み
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // MNI標準脳の読み込み
        const mni = await loadNiftiFile(mniUrl);
        setMniData(mni);
        
        // NIFTIデータの詳細情報をコンソールに出力（デバッグ用）
        console.log('MNI NIFTI Header情報:', {
          dimensions: [mni.dims[1], mni.dims[2], mni.dims[3]],
          pixelDimensions: [mni.pixDims[1], mni.pixDims[2], mni.pixDims[3]],
          datatype: mni.datatypeCode,
          voxOffset: mni.voxOffset,
          qformCode: mni.qformCode,
          sformCode: mni.sformCode,
          xyzt_units: mni.xyzt_units,
          imageSize: mni.image ? mni.image.byteLength : 0
        });
        
        // typedImageを使用
        setMniVolume(mni.typedImage);
        
        // 最大輝度値を計算（コントラスト調整用）
        let max = 0;
        const typedArray = mni.typedImage;
        for (let i = 0; i < typedArray.length; i++) {
          if (typedArray[i] > max) max = typedArray[i];
        }
        setMaxIntensity(max);
        console.log('MNI最大輝度値:', max);
        
        // 次元情報の設定
        const dims: [number, number, number] = [mni.dims[1], mni.dims[2], mni.dims[3]];
        setDimensions(dims);
        
        // AALデータの読み込み
        try {
          console.log('AALデータを読み込み中:', aalUrl);
          const aal = await loadNiftiFile(aalUrl);
          setAalData(aal);
          setAalVolume(aal.typedImage);
          
          console.log('AAL NIFTI Header情報:', {
            dimensions: [aal.dims[1], aal.dims[2], aal.dims[3]],
            pixelDimensions: [aal.pixDims[1], aal.pixDims[2], aal.pixDims[3]],
            datatype: aal.datatypeCode,
            voxOffset: aal.voxOffset,
            qformCode: aal.qformCode,
            sformCode: aal.sformCode,
            xyzt_units: aal.xyzt_units,
            imageSize: aal.image ? aal.image.byteLength : 0
          });
          
          // AALデータの統計情報を出力
          let nonZeroCount = 0;
          let uniqueValues = new Set();
          for (let i = 0; i < aal.typedImage.length; i++) {
            if (aal.typedImage[i] > 0) {
              nonZeroCount++;
              uniqueValues.add(aal.typedImage[i]);
            }
          }
          console.log('AALデータ統計:', {
            総ボクセル数: aal.typedImage.length,
            非ゼロボクセル数: nonZeroCount,
            ユニーク領域数: uniqueValues.size,
            ユニーク値の例: Array.from(uniqueValues).slice(0, 10)
          });
          
          // AALラベルの確認
          console.log('AALラベル情報:', {
            ラベル数: aalLabels.length,
            ラベル例: aalLabels.slice(0, 5)
          });
          
          // AALとMNIの変換行列を比較（デバッグ用）
          console.log('MNI変換行列:', {
            qform: [
              [mni.qform_code > 0 ? mni.affine[0][0] : 0, mni.qform_code > 0 ? mni.affine[0][1] : 0, mni.qform_code > 0 ? mni.affine[0][2] : 0, mni.qform_code > 0 ? mni.affine[0][3] : 0],
              [mni.qform_code > 0 ? mni.affine[1][0] : 0, mni.qform_code > 0 ? mni.affine[1][1] : 0, mni.qform_code > 0 ? mni.affine[1][2] : 0, mni.qform_code > 0 ? mni.affine[1][3] : 0],
              [mni.qform_code > 0 ? mni.affine[2][0] : 0, mni.qform_code > 0 ? mni.affine[2][1] : 0, mni.qform_code > 0 ? mni.affine[2][2] : 0, mni.qform_code > 0 ? mni.affine[2][3] : 0]
            ],
            sform: [
              [mni.sform_code > 0 ? mni.affine[0][0] : 0, mni.sform_code > 0 ? mni.affine[0][1] : 0, mni.sform_code > 0 ? mni.affine[0][2] : 0, mni.sform_code > 0 ? mni.affine[0][3] : 0],
              [mni.sform_code > 0 ? mni.affine[1][0] : 0, mni.sform_code > 0 ? mni.affine[1][1] : 0, mni.sform_code > 0 ? mni.affine[1][2] : 0, mni.sform_code > 0 ? mni.affine[1][3] : 0],
              [mni.sform_code > 0 ? mni.affine[2][0] : 0, mni.sform_code > 0 ? mni.affine[2][1] : 0, mni.sform_code > 0 ? mni.affine[2][2] : 0, mni.sform_code > 0 ? mni.affine[2][3] : 0]
            ]
          });
          
          console.log('AAL変換行列:', {
            qform: [
              [aal.qform_code > 0 ? aal.affine[0][0] : 0, aal.qform_code > 0 ? aal.affine[0][1] : 0, aal.qform_code > 0 ? aal.affine[0][2] : 0, aal.qform_code > 0 ? aal.affine[0][3] : 0],
              [aal.qform_code > 0 ? aal.affine[1][0] : 0, aal.qform_code > 0 ? aal.affine[1][1] : 0, aal.qform_code > 0 ? aal.affine[1][2] : 0, aal.qform_code > 0 ? aal.affine[1][3] : 0],
              [aal.qform_code > 0 ? aal.affine[2][0] : 0, aal.qform_code > 0 ? aal.affine[2][1] : 0, aal.qform_code > 0 ? aal.affine[2][2] : 0, aal.qform_code > 0 ? aal.affine[2][3] : 0]
            ],
            sform: [
              [aal.sform_code > 0 ? aal.affine[0][0] : 0, aal.sform_code > 0 ? aal.affine[0][1] : 0, aal.sform_code > 0 ? aal.affine[0][2] : 0, aal.sform_code > 0 ? aal.affine[0][3] : 0],
              [aal.sform_code > 0 ? aal.affine[1][0] : 0, aal.sform_code > 0 ? aal.affine[1][1] : 0, aal.sform_code > 0 ? aal.affine[1][2] : 0, aal.sform_code > 0 ? aal.affine[1][3] : 0],
              [aal.sform_code > 0 ? aal.affine[2][0] : 0, aal.sform_code > 0 ? aal.affine[2][1] : 0, aal.sform_code > 0 ? aal.affine[2][2] : 0, aal.sform_code > 0 ? aal.affine[2][3] : 0]
            ]
          });
          
          // MNIからAALへの変換行列を計算
          // MNI座標系からAAL座標系への変換行列を計算
          try {
            const mniToAal = calculateTransformMatrix(mni.affine, aal.affine);
            setMniToAalTransform(mniToAal);
            console.log('MNI→AAL変換行列:', mniToAal);
          } catch (err) {
            console.error('変換行列の計算中にエラーが発生しました:', err);
            // デフォルトの単位行列を使用
            setMniToAalTransform([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);
          }
          
          // スライスインデックスの初期化
          const initialIndex = Math.floor(dims[getSliceAxis()] / 2);
          setCurrentSliceIndex(sliceIndex !== undefined ? sliceIndex : initialIndex);
          
          setIsLoading(false);
        } catch (aalError) {
          console.error('AALデータの読み込み中にエラーが発生しました:', aalError);
          setError('AALデータの読み込みに失敗しました。');
        }
      } catch (error) {
        console.error('脳データの読み込み中にエラーが発生しました:', error);
        setError('脳データの読み込み中にエラーが発生しました。');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [mniUrl, aalUrl, aalLabels]);

  // スライスインデックスの更新
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (sliceIndex !== undefined && dimensions[getSliceAxis()] > 0) {
      setCurrentSliceIndex(Math.min(Math.max(0, sliceIndex), dimensions[getSliceAxis()] - 1));
    }
  }, [sliceIndex, dimensions, sliceType]);

  // スライス軸のインデックスを取得
  const getSliceAxis = () => {
    switch (sliceType) {
      case 'sagittal': return 0; // X軸
      case 'coronal': return 1;  // Y軸
      case 'axial': return 2;    // Z軸
      default: return 2;
    }
  };

  // MNIからAALへの座標変換行列を計算する関数
  const calculateTransformMatrix = (mniAffine: number[][], aalAffine: number[][]) => {
    // 入力チェック
    if (!mniAffine || !aalAffine || !Array.isArray(mniAffine) || !Array.isArray(aalAffine)) {
      console.error('無効な変換行列:', { mniAffine, aalAffine });
      return [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    }
    
    // MNI座標系からボクセル座標系への変換行列（逆行列）
    const mniInv = invertMatrix(mniAffine);
    
    // AAL座標系からボクセル座標系への変換行列
    // MNI→ボクセル→AALの順に変換
    const transform = multiplyMatrices(aalAffine, mniInv);
    
    return transform;
  };

  // 行列の逆行列を計算する関数
  const invertMatrix = (m: number[][]) => {
    // 入力チェック
    if (!m || !Array.isArray(m) || m.length < 3 || 
        !m[0] || !Array.isArray(m[0]) || m[0].length < 4 ||
        !m[1] || !Array.isArray(m[1]) || m[1].length < 4 ||
        !m[2] || !Array.isArray(m[2]) || m[2].length < 4) {
      console.error('無効な行列形式:', m);
      return [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    }
    
    // 4x4行列の逆行列を計算（簡易版）
    // 実際の実装では完全な逆行列計算が必要
    const det = 
      m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
      m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
      m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    
    if (Math.abs(det) < 1e-10) {
      console.error('行列の逆行列が計算できません（特異行列）');
      return [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    }
    
    const invDet = 1 / det;
    
    // 3x3部分の逆行列を計算
    const inv = [
      [
        invDet * (m[1][1] * m[2][2] - m[1][2] * m[2][1]),
        invDet * (m[0][2] * m[2][1] - m[0][1] * m[2][2]),
        invDet * (m[0][1] * m[1][2] - m[0][2] * m[1][1]),
        0
      ],
      [
        invDet * (m[1][2] * m[2][0] - m[1][0] * m[2][2]),
        invDet * (m[0][0] * m[2][2] - m[0][2] * m[2][0]),
        invDet * (m[0][2] * m[1][0] - m[0][0] * m[1][2]),
        0
      ],
      [
        invDet * (m[1][0] * m[2][1] - m[1][1] * m[2][0]),
        invDet * (m[0][1] * m[2][0] - m[0][0] * m[2][1]),
        invDet * (m[0][0] * m[1][1] - m[0][1] * m[1][0]),
        0
      ],
      [0, 0, 0, 1]
    ];
    
    // 平行移動成分の計算
    inv[0][3] = -(inv[0][0] * m[0][3] + inv[0][1] * m[1][3] + inv[0][2] * m[2][3]);
    inv[1][3] = -(inv[1][0] * m[0][3] + inv[1][1] * m[1][3] + inv[1][2] * m[2][3]);
    inv[2][3] = -(inv[2][0] * m[0][3] + inv[2][1] * m[1][3] + inv[2][2] * m[2][3]);
    
    return inv;
  };

  // 行列の乗算を行う関数
  const multiplyMatrices = (a: number[][], b: number[][]) => {
    // 入力チェック
    if (!a || !b || !Array.isArray(a) || !Array.isArray(b) ||
        a.length < 3 || b.length < 3) {
      console.error('無効な行列形式:', { a, b });
      return [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    }
    
    const result = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 1]
    ];
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        if (!a[i] || !b[0] || !b[1] || !b[2] || 
            a[i].length < 4 || b[0].length < 4 || b[1].length < 4 || b[2].length < 4) {
          console.error('行列の次元が不正です');
          return [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
        }
        
        result[i][j] = 
          a[i][0] * b[0][j] +
          a[i][1] * b[1][j] +
          a[i][2] * b[2][j] +
          (j === 3 ? a[i][3] : 0);
      }
    }
    
    return result;
  };

  // MNIボクセル座標からAALボクセル座標への変換
  const transformMniToAalCoordinates = (x: number, y: number, z: number) => {
    try {
      // AALデータが存在しない場合は変換しない
      if (!aalData || !aalData.dims) {
        return [x, y, z];
      }
      
      // MNIとAALのデータが同じ次元と解像度を持つと仮定して、直接座標を使用
      // 実際のプロジェクトでは、両方のデータが同じ空間に正規化されていることを確認する必要があります
      
      // AALデータの次元を取得
      const aalDimX = aalData.dims[1];
      const aalDimY = aalData.dims[2];
      const aalDimZ = aalData.dims[3];
      
      // MNIデータの次元を取得
      const mniDimX = dimensions[0];
      const mniDimY = dimensions[1];
      const mniDimZ = dimensions[2];
      
      // 次元の比率を計算
      const scaleX = aalDimX / mniDimX;
      const scaleY = aalDimY / mniDimY;
      const scaleZ = aalDimZ / mniDimZ;
      
      // スケーリングした座標を計算
      const aalX = Math.round(x * scaleX);
      const aalY = Math.round(y * scaleY);
      const aalZ = Math.round(z * scaleZ);
      
      // 座標が有効範囲内かチェック
      if (
        aalX >= 0 && aalX < aalDimX &&
        aalY >= 0 && aalY < aalDimY &&
        aalZ >= 0 && aalZ < aalDimZ
      ) {
        return [aalX, aalY, aalZ];
      } else {
        console.log(`変換後の座標が範囲外です: [${aalX}, ${aalY}, ${aalZ}], AAL次元: [${aalDimX}, ${aalDimY}, ${aalDimZ}]`);
        return [-1, -1, -1]; // 範囲外を示す
      }
    } catch (err) {
      console.error('座標変換中にエラーが発生しました:', err);
      return [-1, -1, -1]; // エラー時は無効な座標を返す
    }
  };

  // AALデータの表示設定
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // AALデータの表示を常に有効にする
    // 親コンポーネントから受け取るようになったので不要
    // setShowAAL(true);
  }, []);

  // スライスの描画
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!canvasRef.current || !mniVolume || dimensions[0] === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスのサイズを設定
    let width, height;
    
    switch (sliceType) {
      case 'sagittal': // X軸に垂直なスライス (YZ平面)
        width = dimensions[1];
        height = dimensions[2];
        break;
      case 'coronal': // Y軸に垂直なスライス (XZ平面)
        width = dimensions[0];
        height = dimensions[2];
        break;
      case 'axial': // Z軸に垂直なスライス (XY平面)
      default:
        width = dimensions[0];
        height = dimensions[1];
        break;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // イメージデータの作成
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    // コントラスト調整のためのスケーリング係数
    const scaleFactor = 255 / maxIntensity;
    
    // スライスデータの抽出と描画
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // 画像を180度回転させるために座標を反転
        const flippedX = width - 1 - x;
        const flippedY = height - 1 - y;
        
        const pixelIndex = (y * width + x) * 4;
        
        // ボリュームデータ内の位置を計算
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let volumeIndex;
        let aalIndex;
        let mniX, mniY, mniZ;
        
        // 各スライスタイプに応じた3次元→1次元インデックス変換
        const dimX = dimensions[0];
        const dimY = dimensions[1];
        const slicePos = currentSliceIndex;
        
        switch (sliceType) {
          case 'sagittal': // YZ平面 (x固定)
            mniX = slicePos;
            mniY = flippedX;
            mniZ = flippedY;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            volumeIndex = mniX + mniY * dimX + mniZ * dimX * dimY;
            break;
          case 'coronal': // XZ平面 (y固定)
            mniX = flippedX;
            mniY = slicePos;
            mniZ = flippedY;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            volumeIndex = mniX + mniY * dimX + mniZ * dimX * dimY;
            break;
          case 'axial': // XY平面 (z固定)
            mniX = flippedX;
            mniY = flippedY;
            mniZ = slicePos;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            volumeIndex = mniX + mniY * dimX + mniZ * dimX * dimY;
            break;
        }
        
        // MNI座標からAAL座標への変換
        const [aalX, aalY, aalZ] = transformMniToAalCoordinates(mniX, mniY, mniZ);
        
        // AALボリュームデータ内のインデックスを計算
        aalIndex = -1; // 初期値を設定
        if (aalData) {
          const aalDimX = aalData.dims[1];
          const aalDimY = aalData.dims[2];
          
          // 座標が有効範囲内かチェック
          if (
            aalX >= 0 && aalX < aalData.dims[1] &&
            aalY >= 0 && aalY < aalData.dims[2] &&
            aalZ >= 0 && aalZ < aalData.dims[3]
          ) {
            aalIndex = aalX + aalY * aalDimX + aalZ * aalDimX * aalDimY;
          }
        }
        
        // インデックスが範囲外でないか確認
        if (volumeIndex >= 0 && volumeIndex < mniVolume.length) {
          // MNIデータの値を取得
          const mniValue = mniVolume[volumeIndex];
          
          // AALデータの値を取得（存在する場合）
          let aalValue = 0;
          if (aalVolume && aalIndex >= 0 && aalIndex < aalVolume.length) {
            aalValue = aalVolume[aalIndex];
          }
          
          // 選択された領域かどうかを確認
          const isSelectedRegion = selectedRegion !== null && aalValue === selectedRegion;
          
          // 閾値以上の値のみ表示（背景を除去）
          if (mniValue > 10) {
            // コントラスト調整
            const adjustedValue = Math.min(255, Math.floor(mniValue * scaleFactor));
            
            // AAL領域の表示
            if (showAAL && aalValue > 0) {
              // AALラベルに対応する色を取得
              const labelInfo = aalLabels.find(l => l.index === aalValue);
              
              if (labelInfo) {
                // 色文字列をRGB値に変換
                let color;
                if (labelInfo.color.startsWith('#')) {
                  // HEX形式の場合
                  const hex = labelInfo.color.substring(1);
                  const r = parseInt(hex.substring(0, 2), 16);
                  const g = parseInt(hex.substring(2, 4), 16);
                  const b = parseInt(hex.substring(4, 6), 16);
                  color = { r, g, b };
                } else if (labelInfo.color.startsWith('hsl')) {
                  // HSL形式の場合はRGBに変換
                  const hslMatch = labelInfo.color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
                  if (hslMatch) {
                    const h = parseInt(hslMatch[1], 10) / 360;
                    const s = parseInt(hslMatch[2], 10) / 100;
                    const l = parseInt(hslMatch[3], 10) / 100;
                    
                    // HSL to RGB変換
                    const rgb = hslToRgb(h, s, l);
                    color = { r: rgb[0], g: rgb[1], b: rgb[2] };
                  } else {
                    // デフォルト色
                    color = { r: 50, g: 100, b: 200 };
                  }
                } else {
                  // デフォルト色
                  color = { r: 255, g: 0, b: 0 };
                }
                
                // 選択された領域は強調表示
                if (isSelectedRegion) {
                  data[pixelIndex] = color.r;
                  data[pixelIndex + 1] = color.g;
                  data[pixelIndex + 2] = color.b;
                  data[pixelIndex + 3] = 255; // 完全不透明
                } else {
                  // 選択されていない領域は半透明でオーバーレイ
                  // AAL領域をより見分けやすくするために色の比率を調整
                  data[pixelIndex] = Math.floor((adjustedValue * 0.3) + (color.r * 0.7));
                  data[pixelIndex + 1] = Math.floor((adjustedValue * 0.3) + (color.g * 0.7));
                  data[pixelIndex + 2] = Math.floor((adjustedValue * 0.3) + (color.b * 0.7));
                  data[pixelIndex + 3] = 255;
                }
              } else {
                // AAL表示がオフの場合はグレースケールで表示
                data[pixelIndex] = adjustedValue;
                data[pixelIndex + 1] = adjustedValue;
                data[pixelIndex + 2] = adjustedValue;
                data[pixelIndex + 3] = 255; // 完全不透明
              }
            } else {
              // AAL表示がオフの場合はグレースケールで表示
              data[pixelIndex] = adjustedValue;
              data[pixelIndex + 1] = adjustedValue;
              data[pixelIndex + 2] = adjustedValue;
              data[pixelIndex + 3] = 255; // 完全不透明
            }
          } else {
            // 背景は透明
            data[pixelIndex] = 0;
            data[pixelIndex + 1] = 0;
            data[pixelIndex + 2] = 0;
            data[pixelIndex + 3] = 0;
          }
        } else {
          // 範囲外のインデックスは透明に
          data[pixelIndex] = 0;
          data[pixelIndex + 1] = 0;
          data[pixelIndex + 2] = 0;
          data[pixelIndex + 3] = 0;
        }
      }
    }
    
    // イメージデータの描画
    ctx.putImageData(imageData, 0, 0);
    
    // キャンバスをコンテナに合わせてスケーリング
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight - 40; // スライダー用のスペースを確保
      const scale = Math.min(containerWidth / width, containerHeight / height);
      
      canvas.style.width = `${width * scale}px`;
      canvas.style.height = `${height * scale}px`;
    }
  }, [mniVolume, aalVolume, dimensions, currentSliceIndex, sliceType, maxIntensity, selectedRegion, aalLabels, showAAL]);

  // HSLからRGBへの変換関数
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // アクロマティック
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  // キャンバスクリックイベントハンドラ
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !aalVolume || dimensions[0] === 0) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // クリック位置をキャンバス座標に変換
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    
    // 画像の回転を考慮して座標を反転
    const width = canvas.width;
    const height = canvas.height;
    const flippedX = width - 1 - x;
    const flippedY = height - 1 - y;
    
    // ボリュームデータ内の位置を計算
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let volumeIndex;
    let aalIndex;
    let mniX, mniY, mniZ;
    
    // 各スライスタイプに応じた3次元→1次元インデックス変換
    const dimX = dimensions[0];
    const dimY = dimensions[1];
    const slicePos = currentSliceIndex;
    
    switch (sliceType) {
      case 'sagittal': // YZ平面 (x固定)
        mniX = slicePos;
        mniY = flippedX;
        mniZ = flippedY;
        volumeIndex = mniX + mniY * dimX + mniZ * dimX * dimY;
        break;
      case 'coronal': // XZ平面 (y固定)
        mniX = flippedX;
        mniY = slicePos;
        mniZ = flippedY;
        volumeIndex = mniX + mniY * dimX + mniZ * dimX * dimY;
        break;
      case 'axial': // XY平面 (z固定)
        mniX = flippedX;
        mniY = flippedY;
        mniZ = slicePos;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        volumeIndex = mniX + mniY * dimX + mniZ * dimX * dimY;
        break;
    }
    
    // MNI座標からAAL座標への変換
    const [aalX, aalY, aalZ] = transformMniToAalCoordinates(mniX, mniY, mniZ);
    
    // AALボリュームデータ内のインデックスを計算
    aalIndex = -1; // 初期値を設定
    if (aalData) {
      const aalDimX = aalData.dims[1];
      const aalDimY = aalData.dims[2];
      
      // 座標が有効範囲内かチェック
      if (
        aalX >= 0 && aalX < aalData.dims[1] &&
        aalY >= 0 && aalY < aalData.dims[2] &&
        aalZ >= 0 && aalZ < aalData.dims[3]
      ) {
        aalIndex = aalX + aalY * aalDimX + aalZ * aalDimX * aalDimY;
      }
    }
    
    // インデックスが範囲外でないか確認
    if (aalIndex >= 0 && aalIndex < aalVolume.length) {
      // AALデータの値を取得
      const aalValue = aalVolume[aalIndex];
      
      // 領域が存在する場合（0以外）は選択
      if (aalValue > 0) {
        onRegionClick(aalValue);
      }
    }
  };

  // マウスホイールイベントハンドラ - 現在は使用されていませんが、将来的に必要になる可能性があるため残しておきます
  /* 
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // ページ全体のスクロールを防止
    
    // ホイールの方向に応じてスライスインデックスを増減（感度を調整）
    // Math.sign()を使用して、小さな変化でも方向を検出
    const delta = Math.sign(e.deltaY);
    const maxIndex = dimensions[getSliceAxis()] - 1;
    const newIndex = Math.min(Math.max(0, currentSliceIndex + delta), maxIndex);
    
    setCurrentSliceIndex(newIndex);
  };
  */

  // スライダーの変更イベントハンドラ
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = parseInt(e.target.value, 10);
    setCurrentSliceIndex(newIndex);
  };

  // マウス移動時のハンドラ
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !mniVolume || dimensions[0] === 0) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // マウス位置をキャンバス座標に変換
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    
    // 画像の回転を考慮して座標を反転
    const flippedX = canvas.width - 1 - x;
    const flippedY = canvas.height - 1 - y;
    
    // スライスタイプに応じたボクセル座標の計算
    let voxelX, voxelY, voxelZ;
    
    switch (sliceType) {
      case 'sagittal': // YZ平面 (x固定)
        voxelX = currentSliceIndex;
        voxelY = flippedX;
        voxelZ = flippedY;
        break;
      case 'coronal': // XZ平面 (y固定)
        voxelX = flippedX;
        voxelY = currentSliceIndex;
        voxelZ = flippedY;
        break;
      case 'axial': // XY平面 (z固定)
      default:
        voxelX = flippedX;
        voxelY = flippedY;
        voxelZ = currentSliceIndex;
        break;
    }
    
    // MNI座標の計算（簡易的な実装）
    const mniX = voxelX;
    const mniY = voxelY;
    const mniZ = voxelZ;
    
    // カーソル位置情報の更新
    setCursorPosition({
      voxel: [voxelX, voxelY, voxelZ],
      mni: [mniX, mniY, mniZ]
    });
  };

  // 最大スライスインデックスを取得
  const getMaxSliceIndex = () => {
    if (dimensions[0] === 0) return 0;
    
    switch (sliceType) {
      case 'sagittal': // X軸方向
        return dimensions[0] - 1;
      case 'coronal': // Y軸方向
        return dimensions[1] - 1;
      case 'axial': // Z軸方向
      default:
        return dimensions[2] - 1;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col" ref={containerRef}>
      <div className="flex-grow flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="mx-auto"
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
        />
      </div>
      
      {/* スライス選択スライダー - 画像の下に配置 */}
      <div className="mt-2 px-4 py-2 bg-gray-100 rounded-md">
        <input
          type="range"
          min="0"
          max={getMaxSliceIndex()}
          value={currentSliceIndex}
          onChange={handleSliderChange}
          className="w-full"
        />
        <div className="flex justify-between text-xs mt-1">
          <span>スライス: {currentSliceIndex + 1}/{getMaxSliceIndex() + 1}</span>
          
          {/* カーソル位置情報 */}
          {cursorPosition && (
            <span>
              位置: [{cursorPosition.voxel[0]}, {cursorPosition.voxel[1]}, {cursorPosition.voxel[2]}]
            </span>
          )}
        </div>
      </div>
      
      {/* 読み込み中表示 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p>脳データを読み込み中...</p>
          </div>
        </div>
      )}
      
      {/* エラー表示 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-75">
          <div className="text-center text-red-600 p-4">
            <p className="font-bold">エラー</p>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
} 