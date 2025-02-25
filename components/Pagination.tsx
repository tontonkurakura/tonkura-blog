import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const separator = "...";

  // 表示するページ番号を決定
  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return pages;
    }

    if (currentPage <= 4) {
      return [...pages.slice(0, 5), separator, totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, separator, ...pages.slice(totalPages - 5)];
    }

    return [
      1,
      separator,
      ...pages.slice(currentPage - 2, currentPage + 1),
      separator,
      totalPages,
    ];
  };

  const visiblePages = getVisiblePages();

  // URLにページパラメータを追加
  const getPageUrl = (page: number) => {
    const hasQueryParams = baseUrl.includes("?");
    const connector = hasQueryParams ? "&" : "?";
    return `${baseUrl}${connector}page=${page}`;
  };

  return (
    <nav
      className="flex justify-center items-center space-x-2 my-8"
      aria-label="ページナビゲーション"
    >
      {/* 前のページへのリンク */}
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          前へ
        </Link>
      )}

      {/* ページ番号 */}
      {visiblePages.map((page, index) => {
        if (page === separator) {
          return (
            <span
              key={`separator-${index}`}
              className="px-3 py-2 text-gray-500"
            >
              {separator}
            </span>
          );
        }

        return (
          <Link
            key={page}
            href={getPageUrl(page)}
            className={`px-3 py-2 rounded-lg ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            } transition-colors`}
          >
            {page}
          </Link>
        );
      })}

      {/* 次のページへのリンク */}
      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          次へ
        </Link>
      )}
    </nav>
  );
}
