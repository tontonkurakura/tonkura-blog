"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import type { Photo, ExifData, AspectRatio } from "@/types/photo";
import { PHOTO_HEIGHTS } from "@/constants/photo";

// シンプルなモーダルコンポーネント
function SimpleImageModal({
  src,
  alt,
  exif,
  onClose,
}: {
  src: string;
  alt?: string;
  exif: ExifData | null;
  onClose: () => void;
}) {
  // モーダルの内部要素への参照
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // ESCキーでモーダルを閉じる
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);

    // モーダルが開いたときにスクロールを無効化
    document.body.style.overflow = "hidden";

    // クリーンアップ関数
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // モーダルが開いたときに閉じるボタンにフォーカス
  useEffect(() => {
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, []);

  // モーダル内でのフォーカストラップを実装
  const handleTabKey = (e: React.KeyboardEvent) => {
    if (e.key === "Tab" && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 w-full h-full"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="画像詳細"
      tabIndex={0}
      aria-describedby="modal-description"
    >
      <span id="modal-description" className="sr-only">
        画像を拡大表示しています。閉じるには、ESCキーを押すか、画面の任意の場所をクリックしてください。
      </span>
      <div
        ref={modalRef}
        className="relative max-w-[95vw] max-h-[95vh] flex flex-col md:flex-row gap-4 items-center"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleTabKey}
        role="presentation"
        tabIndex={-1}
      >
        <div className="max-h-[85vh] max-w-[90vw] md:max-w-[70vw] flex items-center justify-center">
          <Image
            src={src}
            alt={alt || "Photo"}
            width={1200}
            height={800}
            className="object-contain max-h-[85vh] max-w-full"
            style={{ width: "auto", height: "auto" }}
          />
        </div>
        <button
          ref={closeButtonRef}
          className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
          onClick={onClose}
          aria-label="閉じる"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {exif && (
          <div className="text-white bg-black/50 p-4 rounded-lg text-sm w-full md:w-80 self-center max-h-[85vh] overflow-y-auto">
            {alt && <p className="mb-2 font-medium">{alt}</p>}
            <div className="space-y-1.5">
              {exif.date && (
                <p>
                  <span className="text-gray-400">Date:</span>{" "}
                  {new Date(exif.date).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </p>
              )}
              {exif.camera && (
                <p>
                  <span className="text-gray-400">Camera:</span> {exif.camera}
                </p>
              )}
              {exif.lens && exif.lens !== "Unknown" && (
                <p>
                  <span className="text-gray-400">Lens:</span> {exif.lens}
                </p>
              )}
              {exif.focalLength && exif.focalLength !== "Unknown" && (
                <p>
                  <span className="text-gray-400">Focal Length:</span>{" "}
                  {exif.focalLength}
                </p>
              )}
              {exif.aperture && exif.aperture !== "Unknown" && (
                <p>
                  <span className="text-gray-400">Aperture:</span>{" "}
                  {exif.aperture}
                </p>
              )}
              {exif.shutterSpeed && exif.shutterSpeed !== "Unknown" && (
                <p>
                  <span className="text-gray-400">Shutter Speed:</span>{" "}
                  {exif.shutterSpeed}
                </p>
              )}
              {exif.iso && exif.iso !== "Unknown" && (
                <p>
                  <span className="text-gray-400">ISO:</span> {exif.iso}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface PhotoGalleryProps {
  initialPhotos: Photo[];
  heroPhoto: Photo;
}

const getPhotoHeight = (aspectRatio: AspectRatio): number => {
  return PHOTO_HEIGHTS[aspectRatio];
};

const distributePhotos = (photos: Photo[]): Photo[][] => {
  const columnCount = 3;
  const columns: Photo[][] = Array.from({ length: columnCount }, () => []);
  photos.forEach((photo, index) => {
    const columnIndex = index % columnCount;
    columns[columnIndex].push(photo);
  });
  return columns;
};

export default function PhotoGallery({
  initialPhotos,
  heroPhoto,
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredPhotos = useMemo(
    () =>
      initialPhotos
        .filter((photo) => photo.path !== heroPhoto.path)
        .sort(
          (a, b) =>
            new Date(b.exif.date).getTime() - new Date(a.exif.date).getTime()
        ),
    [initialPhotos, heroPhoto]
  );

  const columns = useMemo(
    () => distributePhotos(filteredPhotos),
    [filteredPhotos]
  );

  if (!isClient) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1800px] mx-auto px-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="relative rounded-xl bg-gray-100 animate-pulse"
            style={{ height: "600px" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* ヒーロー写真（ヘッダー背景） */}
      <div className="absolute top-0 left-0 w-screen h-[100vh] -z-10 overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src={heroPhoto.path}
            alt={heroPhoto.description || "Hero photo"}
            fill
            priority
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy0vLi44QjhAOEA4Qi4tMkYyLlFUUVRAR0BXUFNMUE1HUVf/2wBDAR"
            className="object-cover object-top"
            sizes="100vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/fallback.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
          {/* ロケーション情報 */}
          <div className="absolute bottom-8 right-8 flex items-center gap-2 text-white/80 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            <span className="text-sm font-light tracking-wider">
              Chillagoe, Australia
            </span>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-16">
            <h1 className="text-white text-8xl font-bold tracking-wider opacity-0 animate-fadeIn [animation-fill-mode:forwards] [animation-delay:500ms] drop-shadow-lg">
              Ephemera
            </h1>
            <p className="text-white/90 text-2xl tracking-widest mt-12 opacity-0 animate-fadeIn [animation-fill-mode:forwards] [animation-delay:1000ms] drop-shadow-md font-light">
              - Fragments of Consciousness -
            </p>
            <div className="opacity-0 animate-fadeIn [animation-fill-mode:forwards] [animation-delay:1500ms] mt-28">
              <div className="animate-bounce">
                <svg
                  aria-label="Scroll down"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-white/70"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ギャラリーセクション */}
      <div className="relative mt-[85vh] bg-black">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 max-w-[1800px] mx-auto">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="flex flex-col gap-8">
              {column.map((photo, photoIndex) => {
                const height = getPhotoHeight(photo.aspectRatio);
                return (
                  <button
                    key={photo.path}
                    className="relative w-full rounded-xl overflow-hidden cursor-pointer opacity-0 animate-fadeIn [animation-fill-mode:forwards] hover:z-10 group transition-all duration-700 before:absolute before:inset-0 before:z-10 before:bg-gradient-to-t before:from-black/50 before:via-black/20 before:to-transparent before:opacity-0 before:transition-opacity before:duration-700 hover:before:opacity-100 after:absolute after:inset-0 after:rounded-xl after:ring-1 after:ring-white/15 after:transition-all after:duration-700 hover:after:ring-white/30"
                    style={{
                      animationDelay: `${
                        (columnIndex + photoIndex * 3) * 100
                      }ms`,
                      height: `${height}px`,
                      aspectRatio:
                        photo.aspectRatio === "landscape" ? "1.618/1" : "auto",
                      boxShadow:
                        "0 12px 40px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(255, 255, 255, 0.05)",
                    }}
                    onClick={() => setSelectedPhoto(photo)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedPhoto(photo);
                      }
                    }}
                    aria-label={`写真: ${photo.description || "無題"}`}
                  >
                    <Image
                      src={photo.path}
                      alt={photo.description || "Photo"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      priority={columnIndex + photoIndex * 3 < 6}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/fallback.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                    {/* ロケーション情報 */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/90 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm opacity-0 translate-y-4 transition-all duration-700 group-hover:opacity-100 group-hover:translate-y-0 z-20">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                      </svg>
                      <span className="text-xs font-light tracking-wider">
                        {photo.description || "Unknown location"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedPhoto && (
        <SimpleImageModal
          src={selectedPhoto.path}
          alt={selectedPhoto.description}
          exif={selectedPhoto.exif}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </>
  );
}
