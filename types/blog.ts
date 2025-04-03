import {
  BaseMetadata,
  ISODateString,
  PaginationInfo,
  SearchParams,
  SortDirection,
  Taggable,
} from "./common";

/**
 * ブログ記事のメタデータを表す型
 */
export interface PostMeta extends BaseMetadata, Taggable {
  /** 記事のID（ファイル名から拡張子を除いたもの） */
  id: string;
  /** 記事のタイトル */
  title: string;
  /** 記事の公開日（ISO 8601形式の文字列 'YYYY-MM-DD' 形式） */
  date?: ISODateString;
  /** 記事に関連するタグの配列 */
  tags?: string[];
  /** 記事の簡単な説明 */
  description?: string;
  /** 記事の最終更新日（ISO 8601形式の文字列 'YYYY-MM-DD' 形式） */
  lastModified?: ISODateString;
  /** 記事の著者名 */
  author?: string;
  /** 記事の閲覧数 */
  viewCount?: number;
  /** 記事の推定読了時間（分） */
  readingTime?: number;
  /** 前回の記事へのリンク */
  previousPost?: { id: string; title: string };
  /** 次の記事へのリンク */
  nextPost?: { id: string; title: string };
}

/**
 * ブログ記事の完全なデータを表す型
 */
export interface PostData extends PostMeta {
  /** 記事の本文（HTML形式に変換されたMarkdown） */
  content: string;
}

/**
 * ブログ記事の一覧を取得するための関数の戻り値の型
 */
export interface PostListResponse {
  /** 現在のページの記事一覧 */
  posts: PostMeta[];
  /** 全記事数 */
  total: number;
  /** 全ページ数 */
  totalPages: number;
  /** 現在のページ番号 */
  currentPage?: number;
  /** ページネーション情報 */
  pagination?: PaginationInfo;
}

/**
 * ブログ記事の一覧を取得するためのオプションの型
 */
export interface PostListOptions {
  /** フィルタリングするタグ */
  tag?: string;
  /** 検索クエリ */
  searchQuery?: string;
  /** ソート順 - デフォルトは 'date' */
  sortBy?: "date" | "title" | "lastModified" | "viewCount" | "readingTime";
  /** ソート方向 - デフォルトは 'desc' */
  sortDirection?: SortDirection;
  /** 特定の著者のみ表示 */
  author?: string;
  /** 表示件数の制限 */
  limit?: number;
  /** スキップする件数 */
  offset?: number;
  /** 特定の日付以降の記事のみ表示 */
  dateFrom?: ISODateString;
  /** 特定の日付以前の記事のみ表示 */
  dateTo?: ISODateString;
}

/**
 * ディレクトリ構造を表す型
 * オブジェクトのキーはファイル/ディレクトリ名、値は子ディレクトリか"file"文字列
 */
export interface DirectoryStructure {
  [key: string]: DirectoryStructure | "file";
}

/**
 * 記事の並び順設定を表す型
 * defaultOrderはデフォルトの並び順を表す値、optionsは並び順オプションの配列
 */
export interface OrderConfig {
  /** デフォルトのソート順 */
  defaultOrder: string;
  /** 使用可能なソートオプション */
  options: Array<{
    /** ソートオプションの内部値 */
    value: string;
    /** ソートオプションの表示名 */
    label: string;
  }>;
}

/**
 * ブログの検索パラメータを表す型
 */
export interface BlogSearchParams extends SearchParams {
  /** 選択されたタグ */
  tag?: string;
}

/**
 * 記事の関連コンテンツを表す型
 */
export interface RelatedContent {
  /** 関連記事のID */
  id: string;
  /** 関連記事のタイトル */
  title: string;
  /** 関連度（0-1の値） */
  relevance: number;
  /** 関連タイプ（同じタグ、同じ著者など） */
  relationType: "tag" | "author" | "category" | "semantic";
}

/**
 * 記事のコメントを表す型
 */
export interface PostComment {
  /** コメントID */
  id: string;
  /** コメント投稿者名 */
  author: string;
  /** コメント投稿日時 */
  date: ISODateString;
  /** コメント内容 */
  content: string;
  /** コメントの返信 */
  replies?: PostComment[];
  /** 親コメントID（返信の場合） */
  parentId?: string;
}
