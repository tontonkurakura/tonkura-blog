export interface ExifData {
  camera: string;
  lens: string;
  focalLength: string;
  aperture: string;
  shutterSpeed: string;
  iso: string;
  date: string;
}

export interface Photo {
  path: string;
  webpPath: string;
  exif: ExifData;
  description: string;
  aspectRatio: "landscape" | "portrait" | "square";
}
