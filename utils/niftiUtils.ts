import * as nifti from 'nifti-reader-js';
import pako from 'pako';

// NIFTIファイルのキャッシュ
const niftiCache: Record<string, any> = {};
// 先読みキュー
const preloadQueue: string[] = [];
// 先読み中かどうかのフラグ
let isPreloading = false;

/**
 * NIfTIファイルを読み込む関数
 * @param url NIfTIファイルのURL
 * @returns NIfTIデータ
 */
export async function loadNiftiFile(url: string): Promise<any> {
  try {
    // キャッシュにあればそれを返す
    if (niftiCache[url]) {
      console.log(`キャッシュからNIFTIデータを取得: ${url}`);
      return niftiCache[url];
    }
    
    console.log(`NIFTIファイルを読み込み中: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    let data;
    
    // .nii.gz形式の場合は解凍する
    if (url.endsWith('.nii.gz')) {
      try {
        // gzipデータの先頭をスキップ
        const dataView = new DataView(arrayBuffer);
        if (dataView.getUint16(0, true) === 0x8b1f) {
          const inflated = pako.inflate(new Uint8Array(arrayBuffer));
          data = nifti.readHeader(inflated.buffer);
          data.image = nifti.readImage(data, inflated.buffer);
        } else {
          throw new Error('Invalid gzip format');
        }
      } catch (gzipError) {
        console.error('GZIPデータの解凍中にエラーが発生しました:', gzipError);
        throw new Error(`GZIPデータの解凍に失敗しました: ${url}`);
      }
    } else {
      // 通常の.niiファイルの場合
      data = nifti.readHeader(arrayBuffer);
      data.image = nifti.readImage(data, arrayBuffer);
    }
    
    // データ型に関する詳細情報をログ出力
    console.log('NIFTIデータ型情報:', {
      datatypeCode: data.datatypeCode,
      numBitsPerVoxel: data.numBitsPerVoxel,
      littleEndian: data.littleEndian
    });
    
    // データ型に応じた適切なTypedArrayを返す
    if (data.datatypeCode === 2) { // UINT8
      data.typedImage = new Uint8Array(data.image);
    } else if (data.datatypeCode === 4) { // INT16
      data.typedImage = new Int16Array(data.image);
    } else if (data.datatypeCode === 512) { // UINT16
      data.typedImage = new Uint16Array(data.image);
    } else if (data.datatypeCode === 8) { // INT32
      data.typedImage = new Int32Array(data.image);
    } else if (data.datatypeCode === 16) { // FLOAT32
      data.typedImage = new Float32Array(data.image);
    } else if (data.datatypeCode === 64) { // FLOAT64
      data.typedImage = new Float64Array(data.image);
    } else {
      // デフォルトはUint8Array
      data.typedImage = new Uint8Array(data.image);
      console.warn(`未対応のデータ型コード: ${data.datatypeCode}、Uint8Arrayにフォールバック`);
    }
    
    // アフィン変換行列の計算
    // qformとsformの情報を使用して変換行列を計算
    data.affine = calculateAffineMatrix(data);
    
    // キャッシュに保存
    niftiCache[url] = data;
    console.log(`NIFTIファイルの読み込みが完了しました: ${url}`);
    
    return data;
  } catch (error) {
    console.error(`NIFTIファイルの読み込み中にエラーが発生しました: ${url}`, error);
    throw error;
  }
}

/**
 * バックグラウンドでNIFTIファイルを先読みする関数
 * @param urls 先読みするNIFTIファイルのURL配列
 */
export function preloadNiftiFiles(urls: string[]): void {
  // キューに追加
  urls.forEach(url => {
    if (!niftiCache[url] && !preloadQueue.includes(url)) {
      console.log(`先読みキューに追加: ${url}`);
      preloadQueue.push(url);
    }
  });
  
  // 先読み処理が実行中でなければ開始
  if (!isPreloading) {
    processPreloadQueue();
  }
}

/**
 * 先読みキューを処理する関数
 */
async function processPreloadQueue(): Promise<void> {
  if (preloadQueue.length === 0) {
    isPreloading = false;
    return;
  }
  
  isPreloading = true;
  const url = preloadQueue.shift()!;
  
  try {
    console.log(`バックグラウンドでNIFTIファイルを先読み中: ${url}`);
    
    // ファイルが存在するか確認
    try {
      const checkResponse = await fetch(url, { method: 'HEAD' });
      if (!checkResponse.ok) {
        throw new Error(`ファイルが見つかりません: ${url} (${checkResponse.status})`);
      }
      
      await loadNiftiFile(url);
      console.log(`NIFTIファイルの先読み完了: ${url}`);
    } catch (fetchError) {
      console.error(`ファイルの存在確認中にエラーが発生: ${url}`, fetchError);
    }
  } catch (error) {
    console.error(`NIFTIファイルの先読み中にエラーが発生: ${url}`, error);
  } finally {
    // 次のファイルを処理
    setTimeout(() => {
      processPreloadQueue();
    }, 100); // 少し間隔を空けて次のファイルを処理
  }
}

/**
 * NIFTIヘッダーからアフィン変換行列を計算する関数
 * @param header NIFTIヘッダー
 * @returns アフィン変換行列
 */
function calculateAffineMatrix(header: any): number[][] {
  // 4x4のアフィン変換行列を初期化
  const affine = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];
  
  // sform_codeが0より大きい場合はsformを使用
  if (header.sform_code > 0 && header.srow_x && header.srow_y && header.srow_z) {
    affine[0][0] = header.srow_x[0];
    affine[0][1] = header.srow_x[1];
    affine[0][2] = header.srow_x[2];
    affine[0][3] = header.srow_x[3];
    
    affine[1][0] = header.srow_y[0];
    affine[1][1] = header.srow_y[1];
    affine[1][2] = header.srow_y[2];
    affine[1][3] = header.srow_y[3];
    
    affine[2][0] = header.srow_z[0];
    affine[2][1] = header.srow_z[1];
    affine[2][2] = header.srow_z[2];
    affine[2][3] = header.srow_z[3];
  }
  // qform_codeが0より大きい場合はqformを使用（sformが優先）
  else if (header.qform_code > 0 && 
           header.quatern_b !== undefined && 
           header.quatern_c !== undefined && 
           header.quatern_d !== undefined &&
           header.pixDims && header.pixDims.length >= 4) {
    // クォータニオンからアフィン変換行列を計算
    const b = header.quatern_b;
    const c = header.quatern_c;
    const d = header.quatern_d;
    
    // a^2 + b^2 + c^2 + d^2 = 1 を満たすようにaを計算
    const a = Math.sqrt(1.0 - (b * b + c * c + d * d));
    
    // 回転行列の要素を計算
    const xd = header.pixDims[1];
    const yd = header.pixDims[2];
    const zd = header.pixDims[3];
    
    // クォータニオンから回転行列を計算
    affine[0][0] = (a*a + b*b - c*c - d*d) * xd;
    affine[0][1] = 2.0 * (b*c - a*d) * yd;
    affine[0][2] = 2.0 * (b*d + a*c) * zd;
    
    affine[1][0] = 2.0 * (b*c + a*d) * xd;
    affine[1][1] = (a*a + c*c - b*b - d*d) * yd;
    affine[1][2] = 2.0 * (c*d - a*b) * zd;
    
    affine[2][0] = 2.0 * (b*d - a*c) * xd;
    affine[2][1] = 2.0 * (c*d + a*b) * yd;
    affine[2][2] = (a*a + d*d - b*b - c*c) * zd;
    
    // 平行移動成分
    if (header.qoffset_x !== undefined && 
        header.qoffset_y !== undefined && 
        header.qoffset_z !== undefined) {
      affine[0][3] = header.qoffset_x;
      affine[1][3] = header.qoffset_y;
      affine[2][3] = header.qoffset_z;
    }
  }
  // どちらも0の場合はピクセル寸法を使用
  else if (header.pixDims && header.pixDims.length >= 4) {
    affine[0][0] = header.pixDims[1];
    affine[1][1] = header.pixDims[2];
    affine[2][2] = header.pixDims[3];
  } else {
    console.warn('NIFTIヘッダーに変換行列情報が不足しています。単位行列を使用します。');
  }
  
  return affine;
}

/**
 * AALラベルファイルを読み込む関数
 * @param url ラベルファイルのURL
 * @returns ラベル情報の配列
 */
export async function loadAALLabels(url: string): Promise<{ index: number; name: string; color: string }[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    
    const text = await response.text();
    const lines = text.split('\n');
    
    // 色のパレットを定義（脳領域の可視化に適した色、やや薄めの色を使用）
    const colorPalettes = {
      // 前頭葉 - 赤系
      frontal: ['#FF5555', '#FF7777', '#FF9999'],
      // 側頭葉 - 青系
      temporal: ['#5555FF', '#7777FF', '#9999FF'],
      // 頭頂葉 - 緑系
      parietal: ['#55AA55', '#77CC77', '#99EE99'],
      // 後頭葉 - 紫系
      occipital: ['#AA55AA', '#CC77CC', '#EE99EE'],
      // 小脳 - 黄色系
      cerebellum: ['#AAAA00', '#CCCC00', '#EEEE00'],
      // 帯状回 - オレンジ系（より統一感のある色に変更）
      cingulate: ['#FF8800', '#FF9933', '#FFAA55'],
      // 島 - 青緑系
      insula: ['#00AAAA', '#00CCCC', '#00EEEE'],
      // 基底核 - 茶系
      basal: ['#AA5500', '#CC7700', '#EE9900'],
      // 視床 - ピンク系
      thalamus: ['#FF00AA', '#FF33CC', '#FF66EE'],
      // 脳幹 - 灰色系
      brainstem: ['#777777', '#999999', '#BBBBBB'],
      // その他 - 水色系
      other: ['#00AAFF', '#33CCFF', '#66EEFF']
    };
    
    // 領域名から解剖学的カテゴリを判定する関数
    const getAnatomicalCategory = (name: string): string => {
      const lowerName = name.toLowerCase();
      
      // 名前から左右の情報を削除して基本名を取得
      const baseName = lowerName
        .replace(/left|right|l\.|r\.|\(l\)|\(r\)/g, '')
        .trim();
      
      if (baseName.includes('frontal')) return 'frontal';
      if (baseName.includes('temporal')) return 'temporal';
      if (baseName.includes('parietal')) return 'parietal';
      if (baseName.includes('occipital')) return 'occipital';
      if (baseName.includes('cerebellum') || baseName.includes('cerebellar')) return 'cerebellum';
      if (baseName.includes('cingulate') || baseName.includes('cingulum')) return 'cingulate';
      if (baseName.includes('insula')) return 'insula';
      if (baseName.includes('caudate') || baseName.includes('putamen') || 
          baseName.includes('pallidum') || baseName.includes('nucleus')) return 'basal';
      if (baseName.includes('thalamus')) return 'thalamus';
      if (baseName.includes('brain stem') || baseName.includes('pons') || 
          baseName.includes('medulla')) return 'brainstem';
      
      // 特定のカテゴリに当てはまらない場合
      return 'other';
    };
    
    // 基本名（左右の情報を除いた名前）をキーとして色を保存する辞書
    const baseNameColorMap: Record<string, string> = {};
    
    // 最初にすべての基本名を収集
    const baseNames = lines
      .filter(line => line.trim() !== '')
      .map(line => {
        const parts = line.split(/\s+/);
        let name;
        if (parts.length >= 3 && !isNaN(parseInt(parts[parts.length - 1], 10))) {
          name = parts.slice(1, parts.length - 1).join(' ').trim();
        } else {
          name = parts.slice(1).join(' ').trim();
        }
        
        // 左右の情報を削除して基本名を取得
        return name.toLowerCase()
          .replace(/left|right|l\.|r\.|\(l\)|\(r\)/g, '')
          .trim();
      });
    
    // 基本名ごとに一意の色を割り当て
    const uniqueBaseNames = [...new Set(baseNames)];
    uniqueBaseNames.forEach((baseName, idx) => {
      const category = getAnatomicalCategory(baseName);
      const palette = colorPalettes[category as keyof typeof colorPalettes] || colorPalettes.other;
      
      // 同じカテゴリ内で色のバリエーションを作る
      const colorVariationIndex = idx % palette.length;
      baseNameColorMap[baseName] = palette[colorVariationIndex];
    });
    
    // ラベル情報を解析
    const labels = lines
      .filter(line => line.trim() !== '')
      .map((line, idx) => {
        const parts = line.split(/\s+/);
        const index = parseInt(parts[0], 10);
        
        // 新しいフォーマットに対応（インデックス 名前 インデックス）
        // 最後の数値を除外して名前を取得
        let name;
        if (parts.length >= 3 && !isNaN(parseInt(parts[parts.length - 1], 10))) {
          name = parts.slice(1, parts.length - 1).join(' ').trim();
        } else {
          name = parts.slice(1).join(' ').trim();
        }
        
        // 左右の情報を削除して基本名を取得
        const baseName = name.toLowerCase()
          .replace(/left|right|l\.|r\.|\(l\)|\(r\)/g, '')
          .trim();
        
        // 基本名に対応する色を取得
        const color = baseNameColorMap[baseName] || colorPalettes.other[0];
        
        return { index, name, color };
      })
      // AAL3で空になっている領域（前部帯状回(35, 36)と視床(81, 82)）を除外
      .filter(label => {
        return ![35, 36, 81, 82].includes(label.index);
      });
    
    return labels;
  } catch (error) {
    console.error('Error loading AAL labels:', error);
    throw error;
  }
}

/**
 * AAL日本語ラベルファイル（CSV）を読み込む関数
 * @param url CSVファイルのURL
 * @returns 英語ラベルをキー、日本語ラベルを値とするオブジェクト
 */
export async function loadAALJapaneseLabels(url: string): Promise<Record<string, string>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    
    const text = await response.text();
    const lines = text.split('\n');
    
    // ヘッダー行をスキップ
    const dataLines = lines.slice(1);
    
    // 英語ラベルと日本語ラベルのマッピングを作成
    const labelMap: Record<string, string> = {};
    
    dataLines.forEach(line => {
      if (line.trim() === '') return;
      
      // CSVの行を解析
      const parts = line.split(',');
      if (parts.length >= 4) {
        const englishLabel = parts[0].trim();
        const japaneseLabel = parts[1].trim();
        const laterality = parts[2].trim();
        
        // lateralityが存在する場合は、日本語ラベルに追加
        if (laterality) {
          labelMap[englishLabel] = `${japaneseLabel} ${laterality}`;
        } else {
          labelMap[englishLabel] = japaneseLabel;
        }
      }
    });
    
    return labelMap;
  } catch (error) {
    console.error('Error loading AAL Japanese labels:', error);
    throw error;
  }
}

/**
 * AAL日本語ラベルファイル（JSON）を読み込む関数
 * @param url JSONファイルのURL
 * @returns AALラベルの詳細情報を含む配列
 */
export async function loadAALJapaneseLabelsJson(url: string): Promise<Array<{
  englishLabel: string;
  japaneseLabel: string;
  laterality: string;
  category: string;
}>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading AAL Japanese labels from JSON:', error);
    throw error;
  }
} 