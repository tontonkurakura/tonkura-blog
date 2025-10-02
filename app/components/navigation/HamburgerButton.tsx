/**
 * ハンバーガーメニューボタンのプロパティ
 */
interface HamburgerButtonProps {
  /** メニューが開いているかどうか */
  isOpen: boolean;
  /** メニューの開閉を切り替える関数 */
  onToggle: () => void;
}

/**
 * ハンバーガーメニューボタンコンポーネント
 */
export default function HamburgerButton({
  isOpen,
  onToggle,
}: HamburgerButtonProps) {
  return (
    <button
      className="md:hidden w-8 h-8 flex flex-col justify-center items-center"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls="navigation-menu"
      aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
    >
      <span
        className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
          isOpen ? "rotate-45 translate-y-1.5" : ""
        }`}
      ></span>
      <span
        className={`block w-5 h-0.5 bg-white my-1 transition-all duration-300 ${
          isOpen ? "opacity-0" : ""
        }`}
      ></span>
      <span
        className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
          isOpen ? "-rotate-45 -translate-y-1.5" : ""
        }`}
      ></span>
    </button>
  );
}
