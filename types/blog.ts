/**
 * ブログ記事のメタデータを表す型
 */
export interface PostMeta {
  /** 記事のID（ファイル名から拡張子を除いたもの） */
  id: string;
  /** 記事のタイトル */
  title: string;
  /** 記事の公開日（ISO 8601形式の文字列） */
  date?: string;
  /** 記事に関連するタグの配列 */
  tags?: string[];
  /** 記事の簡単な説明 */
  description?: string;
}

/**
 * ブログ記事の完全なデータを表す型
 */
export interface PostData extends PostMeta {
  /** 記事の本文（Markdown形式） */
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
}

/**
 * ブログ記事の一覧を取得するためのオプションの型
 */
export interface PostListOptions {
  /** フィルタリングするタグ */
  tag?: string;
  /** 検索クエリ */
  searchQuery?: string;
}

/**
 * ディレクトリ構造を表す型
 */
export interface DirectoryStructure {
  [key: string]: DirectoryStructure | "file";
}

/**
 * 記事の並び順設定を表す型
 */
export interface OrderConfig {
  defaultOrder: string;
  options: Array<{
    value: string;
    label: string;
  }>;
}
