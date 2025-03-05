import * as nifti from "nifti-reader-js";
import pako from "pako";

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
      throw new Error(
        `Failed to fetch ${url}: ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    let data: any; // 明示的にany型を使用

    // .nii.gz形式の場合は解凍する
    if (url.endsWith(".nii.gz")) {
      try {
        // gzipデータの先頭をスキップ
        const dataView = new DataView(arrayBuffer);
        if (dataView.getUint16(0, true) === 0x8b1f) {
          const inflated = pako.inflate(new Uint8Array(arrayBuffer));
          data = nifti.readHeader(inflated.buffer as ArrayBuffer);
          data.image = nifti.readImage(data, inflated.buffer as ArrayBuffer);
        } else {
          throw new Error("Invalid gzip format");
        }
      } catch (gzipError) {
        console.error("GZIPデータの解凍中にエラーが発生しました:", gzipError);
        throw new Error(`GZIPデータの解凍に失敗しました: ${url}`);
      }
    } else {
      // 通常の.niiファイルの場合
      data = nifti.readHeader(arrayBuffer);
      data.image = nifti.readImage(data, arrayBuffer);
    }

    // データ型に関する詳細情報をログ出力
    console.log(
      `NIFTIデータ型: ${data.datatypeCode}, ボクセル数: ${data.dims[1] * data.dims[2] * data.dims[3]}`
    );

    // データ型に応じた型付き配列を作成
    if (data.datatypeCode === 2) {
      // UINT8
      data.typedImage = new Uint8Array(data.image);
    } else if (data.datatypeCode === 4) {
      // INT16
      data.typedImage = new Int16Array(data.image);
    } else if (data.datatypeCode === 512) {
      // UINT16
      data.typedImage = new Uint16Array(data.image);
    } else if (data.datatypeCode === 8) {
      // INT32
      data.typedImage = new Int32Array(data.image);
    } else if (data.datatypeCode === 16) {
      // FLOAT32
      data.typedImage = new Float32Array(data.image);
    } else if (data.datatypeCode === 64) {
      // FLOAT64
      data.typedImage = new Float64Array(data.image);
    } else {
      // デフォルトはUint8Array
      data.typedImage = new Uint8Array(data.image);
      console.warn(
        `未対応のデータ型コード: ${data.datatypeCode}、Uint8Arrayにフォールバック`
      );
    }

    // アフィン変換行列の計算
    // qformとsformの情報を使用して変換行列を計算
    data.affine = calculateAffineMatrix(data);

    // キャッシュに保存
    niftiCache[url] = data;
    console.log(`NIFTIファイルの読み込みが完了しました: ${url}`);

    return data;
  } catch (error) {
    console.error(
      `NIFTIファイルの読み込み中にエラーが発生しました: ${url}`,
      error
    );
    throw error;
  }
}

/**
 * バックグラウンドでNIFTIファイルを先読みする関数
 * @param urls 先読みするNIFTIファイルのURL配列
 */
export function preloadNiftiFiles(urls: string[]): void {
  // キューに追加
  urls.forEach((url) => {
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
      const checkResponse = await fetch(url, { method: "HEAD" });
      if (!checkResponse.ok) {
        throw new Error(
          `ファイルが見つかりません: ${url} (${checkResponse.status})`
        );
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
    [0, 0, 0, 1],
  ];

  // sform_codeが0より大きい場合はsformを使用
  if (
    header.sform_code > 0 &&
    header.srow_x &&
    header.srow_y &&
    header.srow_z
  ) {
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
  else if (
    header.qform_code > 0 &&
    header.quatern_b !== undefined &&
    header.quatern_c !== undefined &&
    header.quatern_d !== undefined &&
    header.pixDims &&
    header.pixDims.length >= 4
  ) {
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
    affine[0][0] = (a * a + b * b - c * c - d * d) * xd;
    affine[0][1] = 2.0 * (b * c - a * d) * yd;
    affine[0][2] = 2.0 * (b * d + a * c) * zd;

    affine[1][0] = 2.0 * (b * c + a * d) * xd;
    affine[1][1] = (a * a + c * c - b * b - d * d) * yd;
    affine[1][2] = 2.0 * (c * d - a * b) * zd;

    affine[2][0] = 2.0 * (b * d - a * c) * xd;
    affine[2][1] = 2.0 * (c * d + a * b) * yd;
    affine[2][2] = (a * a + d * d - b * b - c * c) * zd;

    // 平行移動成分
    if (
      header.qoffset_x !== undefined &&
      header.qoffset_y !== undefined &&
      header.qoffset_z !== undefined
    ) {
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
    console.warn(
      "NIFTIヘッダーに変換行列情報が不足しています。単位行列を使用します。"
    );
  }

  return affine;
}

/**
 * AALラベルファイルを読み込む関数
 * @param url ラベルファイルのURL
 * @returns ラベル情報の配列
 */
export async function loadAALLabels(
  url: string
): Promise<{ index: number; name: string; color: string }[]> {
  try {
    // カラーパレットの型定義
    type ColorPalette = {
      frontal: string[];
      parietal: string[];
      occipital: string[];
      temporal: string[];
      basal: string[];
      thalamus: string[];
      cerebellum: string[];
      limbic: string[];
      insula: string[];
      brainstem: string[];
      other: string[];
    };

    // カラーパレット定義 - 鮮やかな色に戻し、透明度を追加（RGBA形式）
    const colorPalette: ColorPalette = {
      // 前頭葉: クールな青色系（透明度0.7）
      frontal: [
        "rgba(43, 87, 151, 0.7)",
        "rgba(58, 117, 196, 0.7)",
        "rgba(80, 148, 222, 0.7)",
        "rgba(115, 178, 242, 0.7)",
      ],
      // 頭頂葉: 緑色系（透明度0.7）
      parietal: [
        "rgba(30, 123, 69, 0.7)",
        "rgba(37, 162, 90, 0.7)",
        "rgba(52, 196, 118, 0.7)",
        "rgba(79, 224, 150, 0.7)",
      ],
      // 後頭葉: 紫色系（透明度0.7）
      occipital: [
        "rgba(94, 42, 142, 0.7)",
        "rgba(121, 53, 184, 0.7)",
        "rgba(151, 71, 219, 0.7)",
        "rgba(181, 109, 245, 0.7)",
      ],
      // 側頭葉: 水色系（透明度0.7）
      temporal: [
        "rgba(0, 139, 139, 0.7)",
        "rgba(0, 174, 174, 0.7)",
        "rgba(0, 209, 209, 0.7)",
        "rgba(0, 245, 245, 0.7)",
      ],
      // 大脳基底核: 赤色系（透明度0.7）
      basal: [
        "rgba(165, 42, 42, 0.7)",
        "rgba(200, 50, 50, 0.7)",
        "rgba(230, 70, 70, 0.7)",
        "rgba(255, 90, 90, 0.7)",
      ],
      // 視床: 赤色系（透明度0.7）
      thalamus: [
        "rgba(139, 0, 0, 0.7)",
        "rgba(178, 0, 0, 0.7)",
        "rgba(214, 0, 0, 0.7)",
        "rgba(250, 0, 0, 0.7)",
      ],
      // 小脳: 黄色系（透明度0.7）
      cerebellum: [
        "rgba(184, 134, 11, 0.7)",
        "rgba(218, 165, 32, 0.7)",
        "rgba(255, 191, 0, 0.7)",
        "rgba(255, 215, 0, 0.7)",
      ],
      // 大脳辺縁系: オレンジ系（透明度0.7）
      limbic: [
        "rgba(210, 105, 30, 0.7)",
        "rgba(230, 126, 34, 0.7)",
        "rgba(243, 156, 18, 0.7)",
        "rgba(255, 165, 0, 0.7)",
      ],
      // 島皮質: ピンク系（透明度0.7）
      insula: [
        "rgba(199, 21, 133, 0.7)",
        "rgba(219, 58, 154, 0.7)",
        "rgba(242, 91, 189, 0.7)",
        "rgba(255, 125, 206, 0.7)",
      ],
      // 脳幹: 茶色系（透明度0.7）
      brainstem: [
        "rgba(139, 69, 19, 0.7)",
        "rgba(160, 82, 45, 0.7)",
        "rgba(184, 115, 51, 0.7)",
        "rgba(205, 133, 63, 0.7)",
      ],
      // その他: グレー系（透明度0.7）
      other: [
        "rgba(105, 105, 105, 0.7)",
        "rgba(128, 128, 128, 0.7)",
        "rgba(169, 169, 169, 0.7)",
        "rgba(192, 192, 192, 0.7)",
      ],
    };

    // 日本語カテゴリ名から英語カテゴリ名へのマッピング
    const categoryMapping: Record<string, keyof ColorPalette> = {
      前頭葉: "frontal",
      頭頂葉: "parietal",
      後頭葉: "occipital",
      側頭葉: "temporal",
      大脳基底核: "basal",
      間脳: "thalamus",
      小脳: "cerebellum",
      大脳辺縁系: "limbic",
      島皮質: "insula",
      脳幹: "brainstem",
      その他: "other",
    };

    // AAL3_Jap.jsonファイルを読み込む
    const japLabelsResponse = await fetch("/data/brain/AAL3_Jap.json");
    const japLabelsData = await japLabelsResponse.json();

    // 英語ラベル名をキーとして、カテゴリと日本語ラベルのマッピングを作成
    const labelInfoMap: Record<
      string,
      { category: string; japaneseLabel: string }
    > = {};
    japLabelsData.forEach((item: any) => {
      labelInfoMap[item.englishLabel] = {
        category: item.category,
        japaneseLabel: item.japaneseLabel,
      };
    });

    // ラベルファイルを取得
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split("\n");

    // 結果を格納する配列
    const result: { index: number; name: string; color: string }[] = [];

    // AAL3で空のインデックス（35, 36, 81, 82）をフィルタリングするためのセット
    const emptyIndices = new Set([35, 36, 81, 82]);

    // 各行を処理
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith("#")) {
        const [indexStr, name] = line.split(/\s+/, 2);
        const index = parseInt(indexStr, 10);

        // 空のインデックスをスキップ
        if (emptyIndices.has(index)) continue;

        // 英語ラベル名からカテゴリと日本語ラベルを取得
        const labelInfo = labelInfoMap[name] || {
          category: "その他",
          japaneseLabel: name,
        };
        const category = labelInfo.category;

        // カテゴリを英語に変換
        const englishCategory =
          categoryMapping[category] || ("other" as keyof ColorPalette);

        // カテゴリに対応する色パレットを取得
        const palette = colorPalette[englishCategory];

        // 同じカテゴリ内で色のバリエーションを作る
        // インデックスを2で割った値を使用して、左右で同じ色を使用
        const colorIndex = Math.floor(index / 2) % palette.length;
        const color = palette[colorIndex];

        result.push({ index, name, color });
      }
    }

    return result;
  } catch (error) {
    console.error("Error loading AAL labels:", error);
    return [];
  }
}

/**
 * AAL日本語ラベルファイル（CSV）を読み込む関数
 * @param url CSVファイルのURL
 * @returns 英語ラベルをキー、日本語ラベルを値とするオブジェクト
 */
export async function loadAALJapaneseLabels(
  url: string
): Promise<Record<string, string>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const text = await response.text();
    const lines = text.split("\n");

    // ヘッダー行をスキップ
    const dataLines = lines.slice(1);

    // 英語ラベルと日本語ラベルのマッピングを作成
    const labelMap: Record<string, string> = {};

    dataLines.forEach((line) => {
      if (line.trim() === "") return;

      // CSVの行を解析
      const parts = line.split(",");
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
    console.error("Error loading AAL Japanese labels:", error);
    throw error;
  }
}

/**
 * AAL日本語ラベルファイル（JSON）を読み込む関数
 * @param url JSONファイルのURL
 * @returns AALラベルの詳細情報を含む配列
 */
export async function loadAALJapaneseLabelsJson(url: string): Promise<
  Array<{
    englishLabel: string;
    japaneseLabel: string;
    laterality: string;
    category: string;
  }>
> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading AAL Japanese labels from JSON:", error);
    throw error;
  }
}
