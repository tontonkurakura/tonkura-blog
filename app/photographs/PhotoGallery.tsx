"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ImageModal from "@/components/ImageModal";
import type { Photo } from "@/types/photo";

interface PhotoGalleryProps {
  initialPhotos: Photo[];
  heroPhoto: Photo;
}

// 写真の高さを計算する関数
const getPhotoHeight = (aspectRatio: string): number => {
  switch (aspectRatio) {
    case "portrait":
      return 600; // 縦長写真はそのまま
    case "landscape":
      return 370; // 黄金比に合わせて調整（600/1.618 ≈ 370）
    default: // square
      return 500;
  }
};

// 写真を列に分割する関数
const distributePhotos = (photos: Photo[]): Photo[][] => {
  const columnCount = 3; // 3列に変更
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
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [columns, setColumns] = useState<Photo[][]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // ヒーロー写真以外の写真をソート
    const sortedPhotos = [...initialPhotos]
      .filter((photo) => photo.path !== heroPhoto.path)
      .sort(
        (a, b) =>
          new Date(b.exif.date).getTime() - new Date(a.exif.date).getTime()
      );
    setPhotos(sortedPhotos);
  }, [initialPhotos, heroPhoto]);

  useEffect(() => {
    if (isClient) {
      setColumns(distributePhotos(photos));
    }
  }, [photos, isClient]);

  // 初期レンダリング時はスケルトンローディングを表示
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
            className="object-cover object-top"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
        </div>
      </div>

      {/* ギャラリーセクション */}
      <div className="relative mt-[100vh]">
        <div className="bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 max-w-[1800px] mx-auto">
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="flex flex-col gap-8">
                {column.map((photo, photoIndex) => {
                  const height = getPhotoHeight(photo.aspectRatio);
                  return (
                    <div
                      key={photo.path}
                      className="relative w-full rounded-xl overflow-hidden cursor-pointer opacity-0 animate-fadeIn [animation-fill-mode:forwards] hover:z-10 group shadow-lg hover:shadow-xl transition-shadow duration-300"
                      style={{
                        animationDelay: `${
                          (columnIndex + photoIndex * 3) * 100
                        }ms`,
                        height: `${height}px`,
                        aspectRatio:
                          photo.aspectRatio === "landscape"
                            ? "1.618/1"
                            : "auto",
                      }}
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <Image
                        src={photo.webpPath}
                        alt={photo.description}
                        fill
                        className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        priority={columnIndex + photoIndex * 3 < 6}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:opacity-100" />
                      <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 transition-all duration-700 ease-out group-hover:translate-y-0">
                        <div className="flex items-center gap-2 opacity-0 transition-all duration-700 delay-100 ease-out group-hover:opacity-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 text-white/80"
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
                          <p className="text-lg text-white font-medium">
                            {photo.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
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
