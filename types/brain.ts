// AALラベルの型定義
export interface AALLabel {
  index: number;
  name: string;
  color: string;
}

// 日本語ラベルの型定義
export interface AALJapaneseLabel {
  englishLabel: string;
  japaneseLabel: string;
  laterality: string;
  category: string;
  englishName?: string;
  functionalRole?: string | string[];
  symptoms?: string[] | Record<string, string[]>;
  connections?: string[];
  relatedDisorders?: string[];
  references?: string[];
}

// NIFTIデータの型定義
export interface NiftiData {
  dims: number[];
  pixDims: number[];
  datatypeCode: number;
  typedImage:
    | Uint8Array
    | Int16Array
    | Uint16Array
    | Int32Array
    | Float32Array
    | Float64Array;
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