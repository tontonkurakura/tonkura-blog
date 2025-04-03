/**
 * 基本的な日付の型（ISO 8601形式 'YYYY-MM-DD'）
 */
export type ISODateString = string;

/**
 * 基本的なページネーション情報
 */
export interface PaginationInfo {
  /** 現在のページ番号 */
  currentPage: number;
  /** 総ページ数 */
  totalPages: number;
  /** 1ページあたりのアイテム数 */
  itemsPerPage: number;
  /** 総アイテム数 */
  totalItems: number;
}

/**
 * ソート方向
 */
export type SortDirection = "asc" | "desc";

/**
 * 基本的なソート情報
 */
export interface SortInfo {
  /** ソートするフィールド名 */
  field: string;
  /** ソート方向 */
  direction: SortDirection;
}

/**
 * 基本的なフィルター情報
 */
export interface FilterInfo {
  /** フィルターのフィールド */
  field: string;
  /** フィルターの値 */
  value: string | number | boolean | string[] | number[];
  /** フィルターの演算子（equals, contains, greaterThan など） */
  operator?:
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "contains"
    | "in"
    | "between";
}

/**
 * 基本的なメタデータ情報
 */
export interface BaseMetadata {
  /** 作成日時 */
  createdAt?: ISODateString;
  /** 更新日時 */
  updatedAt?: ISODateString;
  /** 作成者 */
  createdBy?: string;
  /** 最終更新者 */
  updatedBy?: string;
  /** 公開状態 */
  published?: boolean;
}

/**
 * 基本的なタグ付け情報
 */
export interface Taggable {
  /** タグのリスト */
  tags?: string[];
}

/**
 * 基本的な検索パラメータ
 */
export interface SearchParams {
  /** ページ番号 */
  page?: string | number;
  /** 1ページあたりのアイテム数 */
  limit?: string | number;
  /** 検索キーワード */
  q?: string;
  /** ソートフィールド */
  sortBy?: string;
  /** ソート方向 */
  sortDir?: SortDirection;
}

/**
 * 基本的なAPIレスポンス
 */
export interface ApiResponse<T> {
  /** データ */
  data: T;
  /** メタデータ */
  meta?: {
    /** ページネーション情報 */
    pagination?: PaginationInfo;
    /** その他のメタデータ */
    [key: string]: any;
  };
  /** ステータス情報 */
  status: {
    /** 成功フラグ */
    success: boolean;
    /** エラーコード */
    code?: string;
    /** エラーメッセージ */
    message?: string;
  };
}

/**
 * 地理座標情報
 */
export interface GeoCoordinates {
  /** 緯度 */
  latitude: number;
  /** 経度 */
  longitude: number;
  /** 高度（メートル） */
  altitude?: number;
}
