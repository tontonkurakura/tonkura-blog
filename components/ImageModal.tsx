"use client";

import { useEffect } from "react";
import Image from "next/image";
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
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="画像詳細"
      tabIndex={0}
    >
      <div className="flex items-center gap-6 max-h-full w-full">
        <div
          className="relative flex-grow"
          style={{
            height: "calc(100vh - 8rem)",
            maxWidth: "calc(100vw - 24rem)",
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="button"
          tabIndex={0}
          aria-label="画像コンテナ"
        >
          <div className="relative w-full h-full">
            <Image
              src={src}
              alt={alt}
              fill
              style={{ objectFit: "contain" }}
              quality={100}
              priority
            />
          </div>
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
        <div className="bg-black/50 p-6 rounded-lg text-white w-80 h-fit flex-shrink-0">
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
