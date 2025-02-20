"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import type { Photo } from "@/types/photo";

interface PhotoModalProps {
  photo: Photo;
  onClose: () => void;
}

export default function PhotoModal({ photo, onClose }: PhotoModalProps) {
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

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

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    setImageAspectRatio(img.naturalWidth / img.naturalHeight);
  };

  const isPortrait = imageAspectRatio ? imageAspectRatio < 1 : false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex items-center justify-center h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-center gap-4 max-h-[calc(100vh-2rem)]">
          <div
            className="relative flex-shrink-0 flex items-center"
            style={{
              maxWidth: isPortrait ? "min(45vw, 800px)" : "min(75vw, 1200px)",
              height: "fit-content",
            }}
          >
            <div className="relative">
              <Image
                src={photo.webpPath}
                alt={photo.description || photo.path}
                width={1920}
                height={1080}
                className="object-contain max-h-[calc(100vh-4rem)]"
                sizes={
                  isPortrait
                    ? "(max-width: 800px) 45vw, 800px"
                    : "(max-width: 1200px) 75vw, 1200px"
                }
                priority
                onLoad={handleImageLoad}
              />
            </div>
          </div>
          <div className="bg-black/50 backdrop-blur-sm p-4 text-white rounded-lg w-64 flex-shrink-0 self-center">
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
