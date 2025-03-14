import { getPhotos } from "@/utils/photoUtils";
import PhotoGallery from "./PhotoGallery";

// ヒーロー写真のファイル名を指定
const HERO_PHOTO_FILENAME = "DSC02359-Enhanced-NR-Pano-Edit.jpg"; // オーストラリアのパノラマ写真

export default async function GalleryPage() {
  const photos = await getPhotos();

  // ヒーロー写真を検索
  const heroPhoto =
    photos.find((photo) => photo.path.includes(HERO_PHOTO_FILENAME)) ||
    photos[0];

  return (
    <div>
      <PhotoGallery initialPhotos={photos} heroPhoto={heroPhoto} />
    </div>
  );
}
