"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageMetadata } from "@/utils/images";

interface GalleryProps {
  images: {
    src: string;
    metadata: ImageMetadata;
  }[];
}

function formatShootingDate(dateStr: string): string {
  // 日付文字列から数字のみを抽出
  const numbers = dateStr.replace(/\D/g, "");
  // 最初の8桁を取得（YYYYMMDD）
  const dateNumbers = numbers.slice(0, 8);
  // YYYY-MM-DD形式に変換
  const year = dateNumbers.slice(0, 4);
  const month = dateNumbers.slice(4, 6);
  const day = dateNumbers.slice(6, 8);
  return `${year}-${month}-${day}`;
}

function formatShutterSpeed(speed: string): string {
  // "1/125s" や "0.5s" などの形式から数値を抽出
  const match = speed.match(/^(\d+\/\d+|\d*\.?\d+)s$/);
  if (!match) return speed;

  const value = match[1];
  if (value.includes("/")) return speed; // すでに分数形式の場合はそのまま返す

  // 小数を分数に変換
  const decimal = parseFloat(value);
  if (decimal >= 1) return speed; // 1秒以上の場合はそのまま返す

  // 分母を計算（例: 0.008 → 1/125）
  const denominator = Math.round(1 / decimal);
  return `1/${denominator}s`;
}

export default function Gallery({ images }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={image.src}
            className="relative aspect-square cursor-pointer overflow-hidden rounded-lg"
            onClick={() => setSelectedImage(index)}
          >
            <Image
              src={(() => {
                const thumbPath = image.src.replace(
                  /^\/processed-images\//,
                  "/processed-images/thumb_"
                );
                console.log("Original path:", image.src);
                console.log("Thumbnail path:", thumbPath);
                return thumbPath;
              })()}
              alt=""
              fill
              className="object-cover transition-transform hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%23cccccc'/%3E%3C/svg%3E"
            />
          </div>
        ))}
      </div>

      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw] flex items-center gap-4">
            <div className="relative">
              <Image
                src={images[selectedImage].src}
                alt=""
                width={images[selectedImage].metadata.width}
                height={images[selectedImage].metadata.height}
                className="max-h-[85vh] w-auto"
                priority={true}
              />
            </div>
            {images[selectedImage].metadata.exif && (
              <div className="w-64 bg-black bg-opacity-50 p-3 text-white rounded-lg self-center">
                <div className="font-mplus text-xs leading-relaxed">
                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                    {images[selectedImage].metadata.exif.camera && (
                      <>
                        <div className="text-gray-300 whitespace-nowrap">
                          Camera:
                        </div>
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                          {images[selectedImage].metadata.exif.camera}
                        </div>
                      </>
                    )}
                    {images[selectedImage].metadata.exif.lens && (
                      <>
                        <div className="text-gray-300 whitespace-nowrap">
                          Lens:
                        </div>
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                          {images[selectedImage].metadata.exif.lens}
                        </div>
                      </>
                    )}
                    {images[selectedImage].metadata.exif.focalLength && (
                      <>
                        <div className="text-gray-300 whitespace-nowrap">
                          Focal Length:
                        </div>
                        <div className="whitespace-nowrap">
                          {images[selectedImage].metadata.exif.focalLength}
                        </div>
                      </>
                    )}
                    {images[selectedImage].metadata.exif.aperture && (
                      <>
                        <div className="text-gray-300 whitespace-nowrap">
                          Aperture:
                        </div>
                        <div className="whitespace-nowrap">
                          {images[selectedImage].metadata.exif.aperture}
                        </div>
                      </>
                    )}
                    {images[selectedImage].metadata.exif.shutterSpeed && (
                      <>
                        <div className="text-gray-300 whitespace-nowrap">
                          Shutter Speed:
                        </div>
                        <div className="whitespace-nowrap">
                          {formatShutterSpeed(
                            images[selectedImage].metadata.exif.shutterSpeed
                          )}
                        </div>
                      </>
                    )}
                    {images[selectedImage].metadata.exif.iso && (
                      <>
                        <div className="text-gray-300 whitespace-nowrap">
                          ISO:
                        </div>
                        <div className="whitespace-nowrap">
                          {images[selectedImage].metadata.exif.iso}
                        </div>
                      </>
                    )}
                    {images[selectedImage].metadata.exif.dateTime && (
                      <>
                        <div className="text-gray-300 whitespace-nowrap">
                          Date:
                        </div>
                        <div className="whitespace-nowrap">
                          {formatShootingDate(
                            images[selectedImage].metadata.exif.dateTime
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
