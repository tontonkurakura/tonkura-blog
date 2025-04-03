import {
  BaseMetadata,
  GeoCoordinates,
  ISODateString,
  SearchParams,
  Taggable,
} from "./common";

/**
 * 写真のアスペクト比を表す型
 */
export type AspectRatio = "landscape" | "portrait" | "square";

/**
 * 写真のEXIF情報を表す型
 */
export interface ExifData {
  /** カメラ本体の機種名 */
  camera: string;
  /** レンズの名称 */
  lens: string;
  /** 焦点距離（例: "50mm"） */
  focalLength: string;
  /** 絞り値（例: "f/2.8"） */
  aperture: string;
  /** シャッタースピード（例: "1/250"） */
  shutterSpeed: string;
  /** ISO感度 */
  iso: string;
  /** 撮影日時（YYYY-MM-DD形式の文字列） */
  date: ISODateString;
  /** 撮影場所 */
  location?: string;
  /** GPS情報 */
  gps?: GeoCoordinates;
  /** ホワイトバランス */
  whiteBalance?: string;
  /** 露出補正値 */
  exposureCompensation?: string;
  /** 測光モード */
  meteringMode?: string;
  /** フォーカスモード */
  focusMode?: string;
}

/**
 * 写真の情報を表す型
 */
export interface Photo extends BaseMetadata, Taggable {
  /** 写真ID */
  id: string;
  /** 写真ファイルへのパス */
  path: string;
  /** WebP形式の写真ファイルへのパス */
  webpPath: string;
  /** 写真のEXIF情報 */
  exif: ExifData;
  /** 写真の説明文 */
  description: string;
  /** 写真のアスペクト比 */
  aspectRatio: AspectRatio;
  /** 写真のタイトル */
  title?: string;
  /** 写真のタグ */
  tags?: string[];
  /** サムネイル画像へのパス */
  thumbnailPath?: string;
  /** 写真の撮影場所 */
  location?: string;
  /** 写真の高さ（ピクセル） */
  height?: number;
  /** 写真の幅（ピクセル） */
  width?: number;
  /** ファイルサイズ（バイト） */
  fileSize?: number;
  /** 写真のカテゴリ */
  category?: string;
  /** お気に入りフラグ */
  isFavorite?: boolean;
  /** 公開/非公開フラグ */
  isPublic?: boolean;
  /** 写真のカラーパレット */
  colorPalette?: string[];
  /** 写真のライセンス情報 */
  license?: string;
}

/**
 * 写真ギャラリーのフィルター設定を表す型
 */
export interface PhotoFilter extends SearchParams {
  /** タグでのフィルタリング */
  tag?: string;
  /** 日付範囲でのフィルタリング */
  dateRange?: {
    /** 開始日 */
    from: ISODateString;
    /** 終了日 */
    to: ISODateString;
  };
  /** カメラ機種でのフィルタリング */
  camera?: string;
  /** レンズでのフィルタリング */
  lens?: string;
  /** アスペクト比でのフィルタリング */
  aspectRatio?: AspectRatio;
  /** 場所でのフィルタリング */
  location?: string;
  /** カテゴリでのフィルタリング */
  category?: string;
  /** お気に入りのみ表示 */
  onlyFavorites?: boolean;
  /** カラーでのフィルタリング（16進数カラーコード） */
  color?: string;
}

/**
 * 写真アルバムを表す型
 */
export interface PhotoAlbum extends BaseMetadata, Taggable {
  /** アルバムID */
  id: string;
  /** アルバム名 */
  name: string;
  /** アルバムの説明 */
  description?: string;
  /** アルバムカバー画像のパス */
  coverImagePath?: string;
  /** アルバムに含まれる写真のID配列 */
  photoIds: string[];
  /** アルバムの作成日 */
  createdAt: ISODateString;
  /** アルバムの更新日 */
  updatedAt?: ISODateString;
  /** アルバムの閲覧数 */
  viewCount?: number;
  /** アルバムのスライドショー設定 */
  slideshowSettings?: {
    /** スライド間の遷移時間（秒） */
    transitionTime: number;
    /** 遷移エフェクト */
    effect: "fade" | "slide" | "zoom";
    /** 自動再生するかどうか */
    autoplay: boolean;
  };
}
