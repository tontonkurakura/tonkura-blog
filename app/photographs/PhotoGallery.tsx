"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { Photo } from "@/types/photo";
import { PHOTO_HEIGHTS } from "@/constants/photo";

const ImageModal = dynamic(() => import("@/components/ImageModal"), {
  loading: () => <div>Loading...</div>,
});

interface PhotoGalleryProps {
  initialPhotos: Photo[];
  heroPhoto: Photo;
}

const getPhotoHeight = (aspectRatio: string): number => {
  return (
    PHOTO_HEIGHTS[aspectRatio as keyof typeof PHOTO_HEIGHTS] ||
    PHOTO_HEIGHTS.landscape
  );
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
              Photographs
            </h1>
            <p className="text-white/90 text-2xl tracking-widest mt-8 opacity-0 animate-fadeIn [animation-fill-mode:forwards] [animation-delay:1000ms] drop-shadow-md font-light">
              - a fragment of consciousness -
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
                  <div
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
                  >
                    <Image
                      src={photo.webpPath}
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
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedPhoto && (
        <ImageModal
          src={selectedPhoto.webpPath}
          alt={selectedPhoto.description}
          exif={selectedPhoto.exif}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </>
  );
}
