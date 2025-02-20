"use client";

import { useState } from "react";
import Image from "next/image";
import PhotoModal from "./PhotoModal";
import type { Photo } from "@/types/photo";

interface PhotoGalleryProps {
  initialPhotos: Photo[];
}

export default function PhotoGallery({ initialPhotos }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {initialPhotos.map((photo) => (
          <div
            key={photo.path}
            className="relative aspect-square cursor-pointer overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-[1.02]"
            onClick={() => setSelectedPhoto(photo)}
          >
            <Image
              src={photo.webpPath}
              alt={photo.path}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
}
