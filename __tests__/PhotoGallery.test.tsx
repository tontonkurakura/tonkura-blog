import { getPhotoHeight } from "@/app/gallery/PhotoGallery";
import { PHOTO_HEIGHTS } from "@/constants/photo";
import type { AspectRatio } from "@/types/photo";

describe("PhotoGallery", () => {
  it("should calculate correct photo height", () => {
    expect(getPhotoHeight("landscape")).toBe(PHOTO_HEIGHTS.landscape);
    expect(getPhotoHeight("portrait")).toBe(PHOTO_HEIGHTS.portrait);
    expect(getPhotoHeight("square")).toBe(PHOTO_HEIGHTS.square);
  });

  it("should return landscape height for unknown aspect ratio", () => {
    // 実装は PHOTO_HEIGHTS[aspectRatio] || PHOTO_HEIGHTS.landscape で
    // 想定外の値を landscape に落とす。そのフォールバックを検証するため、
    // 型にない "unknown" を意図的に渡す（アサーションで型検査を通す）。
    expect(getPhotoHeight("unknown" as AspectRatio)).toBe(
      PHOTO_HEIGHTS.landscape
    );
  });
});
