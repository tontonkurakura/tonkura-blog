import { getPhotoHeight } from "@/app/gallery/PhotoGallery";
import { PHOTO_HEIGHTS } from "@/constants/photo";

describe("PhotoGallery", () => {
  it("should calculate correct photo height", () => {
    expect(getPhotoHeight("landscape")).toBe(PHOTO_HEIGHTS.landscape);
    expect(getPhotoHeight("portrait")).toBe(PHOTO_HEIGHTS.portrait);
    expect(getPhotoHeight("square")).toBe(PHOTO_HEIGHTS.square);
  });

  it("should return landscape height for unknown aspect ratio", () => {
    expect(getPhotoHeight("unknown")).toBe(PHOTO_HEIGHTS.landscape);
  });
});
