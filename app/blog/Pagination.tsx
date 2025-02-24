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
  const maxVisiblePages = 5;

  // 表示するページ番号を計算
  let visiblePages = pages;
  if (totalPages > maxVisiblePages) {
    const start = Math.max(
      Math.min(
        currentPage - Math.floor(maxVisiblePages / 2),
        totalPages - maxVisiblePages + 1
      ),
      1
    );
    visiblePages = pages.slice(start - 1, start - 1 + maxVisiblePages);
  }

  const getPageUrl = (page: number) => {
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}page=${page}`;
  };

  return (
    <nav
      className="flex justify-center items-center space-x-2"
      aria-label="ページネーション"
    >
      {/* 前のページへのリンク */}
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          前へ
        </Link>
      )}

      {/* 最初のページへのリンク（必要な場合） */}
      {visiblePages[0] > 1 && (
        <>
          <Link
            href={getPageUrl(1)}
            className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            1
          </Link>
          {visiblePages[0] > 2 && (
            <span className="px-3 py-2 text-gray-500">...</span>
          )}
        </>
      )}

      {/* ページ番号 */}
      {visiblePages.map((page) => (
        <Link
          key={page}
          href={getPageUrl(page)}
          className={`px-3 py-2 rounded-lg ${
            currentPage === page
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {page}
        </Link>
      ))}

      {/* 最後のページへのリンク（必要な場合） */}
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-3 py-2 text-gray-500">...</span>
          )}
          <Link
            href={getPageUrl(totalPages)}
            className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {totalPages}
          </Link>
        </>
      )}

      {/* 次のページへのリンク */}
      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          次へ
        </Link>
      )}
    </nav>
  );
}
