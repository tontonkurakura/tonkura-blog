"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import type { Photo } from "@/types/photo";

interface PhotoModalProps {
  photo: Photo;
  onClose: () => void;
}

export default function PhotoModal({ photo, onClose }: PhotoModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="写真詳細"
      tabIndex={0}
    >
      <div
        className="relative flex items-center justify-center w-full h-full"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="button"
        tabIndex={0}
        aria-label="モーダルコンテンツ"
      >
        <div className="relative flex items-center gap-6 w-full max-h-[calc(100vh-2rem)]">
          <div
            className="relative flex-grow flex items-center justify-center"
            style={{
              height: "calc(100vh - 8rem)",
            }}
          >
            <div className="relative">
              <Image
                src={photo.path}
                alt={photo.description || photo.path}
                width={2400}
                height={1600}
                className="object-contain max-h-[calc(100vh-8rem)] max-w-[calc(100vw-24rem)]"
                sizes="(max-width: 1600px) 90vw, 1600px"
                priority
              />
            </div>
          </div>
          <div className="bg-black/50 backdrop-blur-sm p-4 text-white rounded-lg w-80 flex-shrink-0 self-center">
            {photo.description && (
              <p className="text-lg font-medium mb-4">{photo.description}</p>
            )}
            <div className="space-y-1.5 text-sm">
              <p>
                <span className="text-gray-400">Camera:</span>{" "}
                {photo.exif.camera}
              </p>
              {photo.exif.lens !== "Unknown" && (
                <p>
                  <span className="text-gray-400">Lens:</span> {photo.exif.lens}
                </p>
              )}
              <p>
                <span className="text-gray-400">Focal Length:</span>{" "}
                {photo.exif.focalLength}
              </p>
              <p>
                <span className="text-gray-400">Aperture:</span>{" "}
                {photo.exif.aperture}
              </p>
              <p>
                <span className="text-gray-400">Shutter Speed:</span>{" "}
                {photo.exif.shutterSpeed}
              </p>
              <p>
                <span className="text-gray-400">ISO:</span> {photo.exif.iso}
              </p>
              <p>
                <span className="text-gray-400">Date:</span>{" "}
                {new Date(photo.exif.date).toLocaleDateString("ja-JP")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
