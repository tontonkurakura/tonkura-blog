"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useWindowSize } from "@/hooks/useWindowSize";
import type { ExifData } from "@/types/photo";

interface ImageModalProps {
  src: string;
  alt: string;
  exif: ExifData;
  onClose: () => void;
}

export default function ImageModal({
  src,
  alt,
  exif,
  onClose,
}: ImageModalProps) {
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // 画像のサイズを取得
    const imageElement = document.createElement("img");
    imageElement.onload = () => {
      const aspectRatio =
        imageElement.naturalWidth / imageElement.naturalHeight;

      // モーダルの最大サイズ（ウィンドウの85%に調整）
      const maxWidth = windowWidth * 0.85;
      const maxHeight = windowHeight * 0.85;

      // アスペクト比を保ちながら、最適なサイズを計算
      let width = maxWidth;
      let height = width / aspectRatio;

      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      setImageSize({ width, height });
    };
    imageElement.src = src;
  }, [src, windowWidth, windowHeight]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-8"
      onClick={onClose}
    >
      <div className="flex items-center gap-6 max-h-full">
        <div
          className="relative"
          style={{
            width: imageSize.width,
            height: imageSize.height,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={src}
            alt={alt}
            fill
            style={{ objectFit: "contain" }}
            quality={100}
            priority
          />
          {/* 閉じるボタン */}
          <button
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-all"
            onClick={onClose}
            aria-label="閉じる"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
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
        </div>

        {/* EXIF情報（右側） */}
        <div className="bg-black/50 p-6 rounded-lg text-white min-w-[300px] h-fit">
          <div className="space-y-2">
            <div>
              <span className="text-gray-400">Location: </span>
              <span>{alt}</span>
            </div>
            <div>
              <span className="text-gray-400">Date: </span>
              <span>
                {new Date(exif.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Camera: </span>
              <span>{exif.camera}</span>
            </div>
            <div>
              <span className="text-gray-400">Lens: </span>
              <span>{exif.lens}</span>
            </div>
            <div>
              <span className="text-gray-400">Focal Length: </span>
              <span>{exif.focalLength}</span>
            </div>
            <div>
              <span className="text-gray-400">Aperture: </span>
              <span>{exif.aperture}</span>
            </div>
            <div>
              <span className="text-gray-400">Shutter Speed: </span>
              <span>{exif.shutterSpeed}</span>
            </div>
            <div>
              <span className="text-gray-400">ISO: </span>
              <span>{exif.iso}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
