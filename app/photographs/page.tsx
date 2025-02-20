import { getPhotos } from "@/utils/photoUtils";
import PhotoGallery from "./PhotoGallery";

export default async function PhotographsPage() {
  const photos = await getPhotos();

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 font-mplus">Photographs</h1>
      <PhotoGallery initialPhotos={photos} />
    </div>
  );
}
