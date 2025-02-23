export const GOLDEN_RATIO = 1.618;
export const BASE_HEIGHT = 600;

export const PHOTO_HEIGHTS = {
  portrait: BASE_HEIGHT,
  landscape: Math.round(BASE_HEIGHT / GOLDEN_RATIO),
  square: Math.round(BASE_HEIGHT * 0.833),
} as const;

export const IMAGE_ANIMATION_CLASSES = {
  fadeIn: "opacity-0 animate-fadeIn [animation-fill-mode:forwards]",
  fadeInUp:
    "transform translate-y-16 opacity-0 animate-fadeIn [animation-fill-mode:forwards]",
  hover: "hover:scale-105 transition-all duration-700 ease-out",
} as const;
