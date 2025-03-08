"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { loadNiftiFile } from "@/utils/niftiUtils";
import { AALLabel, AALJapaneseLabel, NiftiData } from "@/types/brain";

interface BrainSliceViewerProps {
  mniUrl: string;
  aalUrl: string;
  aalLabels: AALLabel[];
  sliceType: "axial" | "coronal" | "sagittal";
  sliceIndex?: number;
  showAAL?: boolean;
  selectedRegion?: number | null;
  hoveredRegion?: number | null;
  onRegionClick?: (
    regionIndex: number | null,
    clickPosition?: [number, number, number]
  ) => void;
  japaneseLabelsData?: AALJapaneseLabel[];
  crosshairPosition?: [number, number, number];
  onCrosshairPositionChange?: (position: [number, number, number]) => void;
  aalOpacity?: number;
  mniOpacity?: number;
  onRegionHover?: (
    regionIndex: number | null,
    position: {
      voxel: [number, number, number];
      mni: [number, number, number];
      sliceType: string;
    }
  ) => void;
}

export default function BrainSliceViewer({
  mniUrl,
  aalUrl,
  aalLabels,
  sliceType,
  sliceIndex,
  showAAL = true,
  selectedRegion = null,
  hoveredRegion = null,
  onRegionClick,
  japaneseLabelsData = [],
  crosshairPosition,
  onCrosshairPositionChange,
  aalOpacity = 30,
  mniOpacity = 0,
  onRegionHover,
}: BrainSliceViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [currentSliceIndex, setCurrentSliceIndex] = useState<number>(0);
  const [mniData, setMniData] = useState<NiftiData | null>(null);
  const [mniVolume, setMniVolume] = useState<
    | Uint8Array
    | Int16Array
    | Uint16Array
    | Int32Array
    | Float32Array
    | Float64Array
    | null
  >(null);
  const [aalData, setAalData] = useState<NiftiData | null>(null);
  const [aalVolume, setAalVolume] = useState<
    | Uint8Array
    | Int16Array
    | Uint16Array
    | Int32Array
    | Float32Array
    | Float64Array
    | null
  >(null);
  const [maxIntensity, setMaxIntensity] = useState<number>(255);
  const [cursorPosition, setCursorPosition] = useState<
    [number, number, number]
  >([0, 0, 0]);
  const [mniToAalTransform, setMniToAalTransform] = useState<number[][]>([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [tooltipContent, setTooltipContent] = useState<string>("");
  const [forceUpdate, setForceUpdate] = useState<number>(0);

  const getSliceAxis = useCallback(() => {
    switch (sliceType) {
      case "sagittal":
        return 0;
      case "coronal":
        return 1;
      case "axial":
      default:
        return 2;
    }
  }, [sliceType]);

  const transformMniToAalCoordinates = useCallback(
    (x: number, y: number, z: number) => {
      try {
        if (!aalData || !aalData.dims) {
          return [x, y, z];
        }

        const aalDimX = aalData.dims[1];
        const aalDimY = aalData.dims[2];
        const aalDimZ = aalData.dims[3];

        const mniDimX = dimensions[0];
        const mniDimY = dimensions[1];
        const mniDimZ = dimensions[2];

        const scaleX = aalDimX / mniDimX;
        const scaleY = aalDimY / mniDimY;
        const scaleZ = aalDimZ / mniDimZ;

        const aalX = Math.round(x * scaleX);
        const aalY = Math.round(y * scaleY);
        const aalZ = Math.round(z * scaleZ);

        if (
          aalX >= 0 &&
          aalX < aalDimX &&
          aalY >= 0 &&
          aalY < aalDimY &&
          aalZ >= 0 &&
          aalZ < aalDimZ
        ) {
          return [aalX, aalY, aalZ];
        } else {
          console.log(
            `変換後の座標が範囲外です: [${aalX}, ${aalY}, ${aalZ}], AAL次元: [${aalDimX}, ${aalDimY}, ${aalDimZ}]`
          );
          return [-1, -1, -1];
        }
      } catch (err) {
        console.error("座標変換中にエラーが発生しました:", err);
        return [-1, -1, -1];
      }
    },
    [aalData, dimensions]
  );

  useEffect(() => {
    const preventScroll = (e: WheelEvent) => {
      if (containerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("wheel", preventScroll, { passive: false });

    return () => {
      document.removeEventListener("wheel", preventScroll);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoadingProgress(0);
        setError(null);

        setLoadingProgress(10);
        const mniData = await loadNiftiFile(mniUrl);
        setMniData(mniData);
        setLoadingProgress(40);

        const dims: [number, number, number] = [
          mniData.dims[1],
          mniData.dims[2],
          mniData.dims[3],
        ];
        setDimensions(dims);

        setMniVolume(mniData.typedImage);

        let maxVal = 0;
        for (let i = 0; i < mniData.typedImage.length; i++) {
          if (mniData.typedImage[i] > maxVal) {
            maxVal = mniData.typedImage[i];
          }
        }
        setMaxIntensity(maxVal);

        if (sliceIndex !== undefined) {
          setCurrentSliceIndex(sliceIndex);
        } else {
          const axis = getSliceAxis();
          setCurrentSliceIndex(Math.floor(dims[axis] / 2));
        }

        setLoadingProgress(70);

        if (aalUrl) {
          const aalData = await loadNiftiFile(aalUrl);
          setAalData(aalData);
          setAalVolume(aalData.typedImage);

          if (mniData.affine && aalData.affine) {
            const aalInv = invertMatrix(aalData.affine);
            const mniToAal = multiplyMatrices(aalInv, mniData.affine);
            setMniToAalTransform(mniToAal);
          }
        }

        setLoadingProgress(100);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading NIFTI data:", err);
        setError("NIFTIデータの読み込み中にエラーが発生しました。");
        setIsLoading(false);
      }
    };

    loadData();
  }, [mniUrl, aalUrl, sliceType, sliceIndex, getSliceAxis]);

  useEffect(() => {
    if (sliceIndex !== undefined && dimensions[getSliceAxis()] > 0) {
      setCurrentSliceIndex(
        Math.min(Math.max(0, sliceIndex), dimensions[getSliceAxis()] - 1)
      );
    }
  }, [sliceIndex, dimensions, getSliceAxis]);

  useEffect(() => {
    const axis = getSliceAxis();
    if (crosshairPosition) {
      setCurrentSliceIndex(crosshairPosition[axis]);
    }
  }, [crosshairPosition, getSliceAxis]);

  const drawCrosshair = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      if (!crosshairPosition) return;

      let x = 0;
      let y = 0;

      switch (sliceType) {
        case "sagittal":
          x = width - crosshairPosition[1] - 1;
          y = dimensions[2] - crosshairPosition[2];
          break;
        case "coronal":
          x = width - crosshairPosition[0] - 1;
          y = dimensions[2] - crosshairPosition[2];
          break;
        case "axial":
          x = width - crosshairPosition[0] - 1;
          y = dimensions[1] - crosshairPosition[1];
          break;
      }

      ctx.strokeStyle = "rgba(255, 0, 0, 1.0)";
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 0, 0, 1.0)";
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    },
    [crosshairPosition, sliceType, dimensions]
  );

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: unknown[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const getMaxSliceIndex = useCallback(() => {
    switch (sliceType) {
      case "sagittal":
        return dimensions[0];
      case "coronal":
        return dimensions[1];
      case "axial":
      default:
        return dimensions[2];
    }
  }, [dimensions, sliceType]);

  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !mniVolume || dimensions[0] === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width, height;

    switch (sliceType) {
      case "sagittal":
        width = dimensions[1];
        height = dimensions[2];
        break;
      case "coronal":
        width = dimensions[0];
        height = dimensions[2];
        break;
      case "axial":
      default:
        width = dimensions[0];
        height = dimensions[1];
        break;
    }

    canvas.width = width;
    canvas.height = height;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    const scaleFactor = 255 / maxIntensity;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let voxelX, voxelY, voxelZ;

        const invertedY = height - y - 1;
        const invertedX = width - x - 1;

        switch (sliceType) {
          case "sagittal":
            voxelX = currentSliceIndex;
            voxelY = invertedX;
            voxelZ = invertedY;
            break;
          case "coronal":
            voxelX = invertedX;
            voxelY = currentSliceIndex;
            voxelZ = invertedY;
            break;
          case "axial":
          default:
            voxelX = invertedX;
            voxelY = invertedY;
            voxelZ = currentSliceIndex;
            break;
        }

        const pixelIndex = (y * width + x) * 4;

        if (
          voxelX >= 0 &&
          voxelX < dimensions[0] &&
          voxelY >= 0 &&
          voxelY < dimensions[1] &&
          voxelZ >= 0 &&
          voxelZ < dimensions[2]
        ) {
          const voxelIndex =
            voxelX +
            voxelY * dimensions[0] +
            voxelZ * dimensions[0] * dimensions[1];

          const mniValue = mniVolume[voxelIndex];

          let aalValue = 0;
          if (aalVolume) {
            const [aalX, aalY, aalZ] = transformMniToAalCoordinates(
              voxelX,
              voxelY,
              voxelZ
            );

            if (aalX >= 0 && aalY >= 0 && aalZ >= 0) {
              const aalIndex =
                aalX +
                aalY * aalData!.dims[1] +
                aalZ * aalData!.dims[1] * aalData!.dims[2];
              aalValue = aalVolume[aalIndex];
            }
          }

          const isSelectedRegion = selectedRegion === aalValue;
          const isHoveredRegion = hoveredRegion === aalValue;

          if (mniValue > 10) {
            let adjustedValue = Math.min(
              255,
              Math.floor(mniValue * scaleFactor)
            );

            const mriAlpha = 1 - mniOpacity / 100;

            if (aalValue > 0) {
              const labelInfo = aalLabels.find((l) => l.index === aalValue);

              if (labelInfo) {
                let color;
                if (labelInfo.color.startsWith("#")) {
                  const hex = labelInfo.color.substring(1);
                  const r = parseInt(hex.substring(0, 2), 16);
                  const g = parseInt(hex.substring(2, 4), 16);
                  const b = parseInt(hex.substring(4, 6), 16);
                  color = { r, g, b, a: 1 };
                } else if (labelInfo.color.startsWith("rgba")) {
                  const rgbaMatch = labelInfo.color.match(
                    /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/
                  );
                  if (rgbaMatch) {
                    const r = parseInt(rgbaMatch[1], 10);
                    const g = parseInt(rgbaMatch[2], 10);
                    const b = parseInt(rgbaMatch[3], 10);
                    const a = parseFloat(rgbaMatch[4]);
                    color = { r, g, b, a };
                  } else {
                    color = { r: 50, g: 100, b: 200, a: 0.7 };
                  }
                } else if (labelInfo.color.startsWith("hsl")) {
                  const hslMatch = labelInfo.color.match(
                    /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/
                  );
                  if (hslMatch) {
                    const h = parseInt(hslMatch[1], 10) / 360;
                    const s = parseInt(hslMatch[2], 10) / 100;
                    const l = parseInt(hslMatch[3], 10) / 100;

                    const rgb = hslToRgb(h, s, l);
                    color = { r: rgb[0], g: rgb[1], b: rgb[2], a: 0.7 };
                  } else {
                    color = { r: 50, g: 100, b: 200, a: 0.7 };
                  }
                } else {
                  color = { r: 50, g: 100, b: 200, a: 0.7 };
                }

                if (showAAL) {
                  if (isSelectedRegion) {
                    data[pixelIndex] = Math.min(255, color.r + 150);
                    data[pixelIndex + 1] = Math.min(255, color.g + 150);
                    data[pixelIndex + 2] = Math.min(255, color.b + 150);
                    data[pixelIndex + 3] = 255;
                  } else if (isHoveredRegion) {
                    data[pixelIndex] = Math.min(255, color.r + 150);
                    data[pixelIndex + 1] = Math.min(255, color.g + 150);
                    data[pixelIndex + 2] = Math.min(255, color.b + 150);
                    data[pixelIndex + 3] = 255;
                  } else {
                    const aalAlpha = (1 - aalOpacity / 100) * color.a;

                    if (showAAL) {
                      data[pixelIndex] = Math.floor(
                        adjustedValue * (1 - aalAlpha) + color.r * aalAlpha
                      );
                      data[pixelIndex + 1] = Math.floor(
                        adjustedValue * (1 - aalAlpha) + color.g * aalAlpha
                      );
                      data[pixelIndex + 2] = Math.floor(
                        adjustedValue * (1 - aalAlpha) + color.b * aalAlpha
                      );
                      data[pixelIndex + 3] = 255;
                    } else {
                      data[pixelIndex] = adjustedValue;
                      data[pixelIndex + 1] = adjustedValue;
                      data[pixelIndex + 2] = adjustedValue;
                      data[pixelIndex + 3] = Math.round(255 * mriAlpha);
                    }
                  }
                } else {
                  data[pixelIndex] = adjustedValue;
                  data[pixelIndex + 1] = adjustedValue;
                  data[pixelIndex + 2] = adjustedValue;
                  data[pixelIndex + 3] = Math.round(255 * mriAlpha);
                }
              } else {
                data[pixelIndex] = adjustedValue;
                data[pixelIndex + 1] = adjustedValue;
                data[pixelIndex + 2] = adjustedValue;
                data[pixelIndex + 3] = Math.round(255 * mriAlpha);
              }
            } else {
              data[pixelIndex] = adjustedValue;
              data[pixelIndex + 1] = adjustedValue;
              data[pixelIndex + 2] = adjustedValue;
              data[pixelIndex + 3] = Math.round(255 * mriAlpha);
            }
          } else {
            data[pixelIndex] = 0;
            data[pixelIndex + 1] = 0;
            data[pixelIndex + 2] = 0;
            data[pixelIndex + 3] = 0;
          }
        } else {
          data[pixelIndex] = 0;
          data[pixelIndex + 1] = 0;
          data[pixelIndex + 2] = 0;
          data[pixelIndex + 3] = 0;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    if (crosshairPosition) {
      drawCrosshair(ctx, width, height);
    }

    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight - 3;
      const scale = Math.min(containerWidth / width, containerHeight / height);

      canvas.style.width = `${width * scale}px`;
      canvas.style.height = `${height * scale}px`;
    }
  }, [
    dimensions,
    aalVolume,
    mniVolume,
    maxIntensity,
    currentSliceIndex,
    showAAL,
    aalOpacity,
    mniOpacity,
    selectedRegion,
    hoveredRegion,
    crosshairPosition,
    transformMniToAalCoordinates,
    getMaxSliceIndex,
  ]);

  const updateCanvasScale = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight - 3;

    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(containerWidth * scale);
    canvas.height = Math.floor(containerHeight * scale);

    ctx.scale(scale, scale);

    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    const handleResize = debounce(() => {
      updateCanvasScale();
    }, 100);

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [updateCanvasScale]);

  const hslToRgb = (
    h: number,
    s: number,
    l: number
  ): [number, number, number] => {
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || dimensions[0] === 0) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      const canvasX = Math.floor(
        (e.clientX - rect.left) * (canvas.width / rect.width)
      );
      const canvasY = Math.floor(
        (e.clientY - rect.top) * (canvas.height / rect.height)
      );

      const invertedCanvasY = canvas.height - canvasY - 1;
      const invertedCanvasX = canvas.width - canvasX - 1;

      let voxelX, voxelY, voxelZ;

      switch (sliceType) {
        case "sagittal":
          voxelX = currentSliceIndex;
          voxelY = invertedCanvasX;
          voxelZ = invertedCanvasY;
          break;
        case "coronal":
          voxelX = invertedCanvasX;
          voxelY = currentSliceIndex;
          voxelZ = invertedCanvasY;
          break;
        case "axial":
        default:
          voxelX = invertedCanvasX;
          voxelY = invertedCanvasY;
          voxelZ = currentSliceIndex;
          break;
      }

      if (
        voxelX >= 0 &&
        voxelX < dimensions[0] &&
        voxelY >= 0 &&
        voxelY < dimensions[1] &&
        voxelZ >= 0 &&
        voxelZ < dimensions[2]
      ) {
        let aalValue = 0;
        if (aalVolume) {
          const [aalX, aalY, aalZ] = transformMniToAalCoordinates(
            voxelX,
            voxelY,
            voxelZ
          );

          if (aalX >= 0 && aalY >= 0 && aalZ >= 0) {
            const aalIndex =
              aalX +
              aalY * aalData!.dims[1] +
              aalZ * aalData!.dims[1] * aalData!.dims[2];
            aalValue = aalVolume[aalIndex];
          }
        }

        if (onRegionClick && aalValue > 0) {
          onRegionClick(aalValue, [voxelX, voxelY, voxelZ]);
        }

        if (onCrosshairPositionChange) {
          const newPosition: [number, number, number] = [
            voxelX,
            voxelY,
            voxelZ,
          ];
          onCrosshairPositionChange(newPosition);
          console.log(
            `${sliceType}断面でクリック: クロスヘア位置を更新 [${voxelX}, ${voxelY}, ${voxelZ}]`
          );
        }

        setCursorPosition([voxelX, voxelY, voxelZ]);
      }
    },
    [
      aalData,
      aalVolume,
      currentSliceIndex,
      dimensions,
      onCrosshairPositionChange,
      onRegionClick,
      sliceType,
      transformMniToAalCoordinates,
    ]
  );

  const getJapaneseNameWithPrefix = useCallback(
    (englishName: string): string => {
      const labelData = japaneseLabelsData.find(
        (item) => item.englishLabel === englishName
      );

      if (labelData) {
        if (labelData.laterality) {
          return labelData.laterality + labelData.japaneseLabel;
        }
        return labelData.japaneseLabel;
      }

      const lowerName = englishName.toLowerCase();
      if (lowerName.includes("frontal")) return "前頭葉領域";
      if (lowerName.includes("temporal")) return "側頭葉領域";
      if (lowerName.includes("parietal")) return "頭頂葉領域";
      if (lowerName.includes("occipital")) return "後頭葉領域";
      if (lowerName.includes("cerebellum")) return "小脳領域";
      if (lowerName.includes("cingulate")) return "帯状回領域";
      if (lowerName.includes("insula")) return "島皮質領域";
      if (lowerName.includes("thalamus")) return "視床領域";

      return "脳領域";
    },
    [japaneseLabelsData]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || dimensions[0] === 0) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      const canvasX = Math.floor(
        (e.clientX - rect.left) * (canvas.width / rect.width)
      );
      const canvasY = Math.floor(
        (e.clientY - rect.top) * (canvas.height / rect.height)
      );

      setTooltipPosition({
        x: e.clientX - rect.left + 20,
        y: e.clientY - rect.top - 40,
      });

      const invertedCanvasY = canvas.height - canvasY - 1;
      const invertedCanvasX = canvas.width - canvasX - 1;

      let voxelX, voxelY, voxelZ;

      switch (sliceType) {
        case "sagittal":
          voxelX = currentSliceIndex;
          voxelY = invertedCanvasX;
          voxelZ = invertedCanvasY;
          break;
        case "coronal":
          voxelX = invertedCanvasX;
          voxelY = currentSliceIndex;
          voxelZ = invertedCanvasY;
          break;
        case "axial":
        default:
          voxelX = invertedCanvasX;
          voxelY = invertedCanvasY;
          voxelZ = currentSliceIndex;
          break;
      }

      if (
        voxelX >= 0 &&
        voxelX < dimensions[0] &&
        voxelY >= 0 &&
        voxelY < dimensions[1] &&
        voxelZ >= 0 &&
        voxelZ < dimensions[2]
      ) {
        const mniX = Math.round((voxelX - 91) * 2.0);
        const mniY = Math.round((voxelY - 109) * 2.0);
        const mniZ = Math.round((voxelZ - 91) * 2.0);

        let aalValue = 0;
        if (aalVolume) {
          const [aalX, aalY, aalZ] = transformMniToAalCoordinates(
            voxelX,
            voxelY,
            voxelZ
          );

          if (aalX >= 0 && aalY >= 0 && aalZ >= 0) {
            const aalIndex =
              aalX +
              aalY * aalData!.dims[1] +
              aalZ * aalData!.dims[1] * aalData!.dims[2];
            aalValue = aalVolume[aalIndex];
          }
        }

        if (aalValue > 0) {
          const region = aalLabels.find((l) => l.index === aalValue);
          if (region) {
            setTooltipContent(getJapaneseNameWithPrefix(region.name));
          } else {
            setTooltipContent(`領域: ${aalValue}`);
          }
        } else {
          setTooltipContent("");
        }

        if (onRegionHover) {
          onRegionHover(aalValue > 0 ? aalValue : null, {
            voxel: [voxelX, voxelY, voxelZ],
            mni: [mniX, mniY, mniZ],
            sliceType: sliceType,
          });
        }

        setCursorPosition([voxelX, voxelY, voxelZ]);
      }
    },
    [
      aalData,
      aalLabels,
      aalVolume,
      currentSliceIndex,
      dimensions,
      onRegionHover,
      sliceType,
      transformMniToAalCoordinates,
      getJapaneseNameWithPrefix,
    ]
  );

  const handleMouseLeave = () => {
    setCursorPosition([0, 0, 0]);
    setTooltipPosition(null);
    setTooltipContent("");
  };

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (!currentSliceIndex) return;

      const delta = e.deltaY > 0 ? 1 : -1;
      const maxIndex = getMaxSliceIndex();
      const newIndex = Math.min(
        Math.max(0, currentSliceIndex + delta),
        maxIndex
      );
      setCurrentSliceIndex(newIndex);

      if (onCrosshairPositionChange && crosshairPosition) {
        const newPosition: [number, number, number] = [
          crosshairPosition[0],
          crosshairPosition[1],
          crosshairPosition[2],
        ];
        newPosition[getSliceAxis()] = newIndex;
        onCrosshairPositionChange(newPosition);
      }
    },
    [
      currentSliceIndex,
      getSliceAxis,
      onCrosshairPositionChange,
      crosshairPosition,
    ]
  );

  const invertMatrix = (m: number[][]): number[][] => {
    if (!m || m.length !== 4 || !m[0] || m[0].length !== 4) {
      console.warn("invertMatrix: 4x4行列のみサポートしています");
      return [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ];
    }

    try {
      const r = [
        [m[0][0], m[0][1], m[0][2]],
        [m[1][0], m[1][1], m[1][2]],
        [m[2][0], m[2][1], m[2][2]],
      ];
      const t = [m[0][3], m[1][3], m[2][3]];

      const det =
        r[0][0] * (r[1][1] * r[2][2] - r[1][2] * r[2][1]) -
        r[0][1] * (r[1][0] * r[2][2] - r[0][2] * r[1][1] * r[2][0]) +
        r[0][2] * (r[1][0] * r[2][1] - r[0][1] * r[1][0] * r[2][1]);

      if (Math.abs(det) < 1e-10) {
        console.warn(
          "invertMatrix: 行列式がゼロに近いため逆行列を計算できません"
        );
        return [
          [1, 0, 0, 0],
          [0, 1, 0, 0],
          [0, 0, 1, 0],
          [0, 0, 0, 1],
        ];
      }

      const adjR = [
        [
          r[1][1] * r[2][2] - r[1][2] * r[2][1],
          r[0][2] * r[2][1] - r[0][1] * r[2][2],
          r[0][1] * r[1][2] - r[0][2] * r[1][1],
        ],
        [
          r[1][2] * r[2][0] - r[1][0] * r[2][2],
          r[0][0] * r[2][2] - r[0][2] * r[2][0],
          r[0][2] * r[1][0] - r[0][0] * r[1][2],
        ],
        [
          r[1][0] * r[2][1] - r[1][1] * r[2][0],
          r[0][1] * r[2][0] - r[0][0] * r[2][1],
          r[0][0] * r[1][1] - r[0][1] * r[1][0],
        ],
      ];

      const invR = adjR.map((row) => row.map((val) => val / det));

      const invT = [
        -(invR[0][0] * t[0] + invR[0][1] * t[1] + invR[0][2] * t[2]),
        -(invR[1][0] * t[0] + invR[1][1] * t[1] + invR[1][2] * t[2]),
        -(invR[2][0] * t[0] + invR[2][1] * t[1] + invR[2][2] * t[2]),
      ];

      return [
        [invR[0][0], invR[0][1], invR[0][2], invT[0]],
        [invR[1][0], invR[1][1], invR[1][2], invT[1]],
        [invR[2][0], invR[2][1], invR[2][2], invT[2]],
        [0, 0, 0, 1],
      ];
    } catch (error) {
      console.error("invertMatrix: エラーが発生しました", error);
      return [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ];
    }
  };

  const multiplyMatrices = (a: number[][], b: number[][]) => {
    if (
      !a ||
      !b ||
      !Array.isArray(a) ||
      !Array.isArray(b) ||
      a.length < 3 ||
      b.length < 3
    ) {
      console.error("無効な行列形式:", { a, b });
      return [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ];
    }

    const result = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 1],
    ];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        if (
          !a[i] ||
          !b[0] ||
          !b[1] ||
          !b[2] ||
          a[i].length < 4 ||
          b[0].length < 4 ||
          b[1].length < 4 ||
          b[2].length < 4
        ) {
          console.error("行列の次元が不正です");
          return [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
          ];
        }

        result[i][j] =
          a[i][0] * b[0][j] +
          a[i][1] * b[1][j] +
          a[i][2] * b[2][j] +
          (j === 3 ? a[i][3] : 0);
      }
    }

    return result;
  };

  const handleSliceChange = useCallback(
    (newIndex: number) => {
      if (newIndex >= 0 && newIndex < getMaxSliceIndex()) {
        setCurrentSliceIndex(newIndex);
        drawCanvas();
      }
    },
    [getMaxSliceIndex, drawCanvas]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-3/4 flex flex-col justify-between"
      onWheel={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div
        className="flex-1 flex flex-col justify-center items-center bg-gray-100 overflow-hidden p-0"
        onWheel={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-24 bg-gray-200 rounded-lg">
            <div className="w-full max-w-md bg-gray-200 rounded-full h-1.5 mb-1">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mb-0.5"></div>
            <p className="text-xs">読み込み中... {loadingProgress}%</p>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div
            className="relative p-0"
            onWheel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const delta = e.deltaY > 0 ? 1 : -1;
              const newIndex = Math.max(
                0,
                Math.min(getMaxSliceIndex(), currentSliceIndex + delta)
              );
              setCurrentSliceIndex(newIndex);

              if (onCrosshairPositionChange && crosshairPosition) {
                let newPosition: [number, number, number] = [
                  ...crosshairPosition,
                ];

                switch (sliceType) {
                  case "sagittal":
                    newPosition[0] = newIndex;
                    break;
                  case "coronal":
                    newPosition[1] = newIndex;
                    break;
                  case "axial":
                  default:
                    newPosition[2] = newIndex;
                    break;
                }

                onCrosshairPositionChange(newPosition);
              }
            }}
          >
            <canvas
              ref={canvasRef}
              className="cursor-crosshair"
              onWheel={handleWheel}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
            {tooltipPosition && tooltipContent && (
              <div
                className="absolute z-10 bg-white px-2 py-1 rounded shadow-md text-sm font-medium text-gray-800 border border-gray-200 whitespace-nowrap"
                style={{
                  left: `${tooltipPosition.x}px`,
                  top: `${tooltipPosition.y}px`,
                  pointerEvents: "none",
                  maxWidth: "none",
                }}
              >
                {tooltipContent}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-1 mb-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-medium text-gray-700">
            {sliceType === "axial"
              ? "軸位断"
              : sliceType === "coronal"
                ? "冠状断"
                : "矢状断"}
          </span>
          <span className="text-[10px] font-medium text-blue-600">
            {currentSliceIndex} / {getMaxSliceIndex()}
          </span>
        </div>

        <div className="p-1 border border-blue-200 rounded bg-blue-50">
          <input
            type="range"
            min="0"
            max={getMaxSliceIndex()}
            value={currentSliceIndex}
            onChange={(e) => {
              const newIndex = parseInt(e.target.value);
              setCurrentSliceIndex(newIndex);

              if (onCrosshairPositionChange && crosshairPosition) {
                let newPosition: [number, number, number] = [
                  ...crosshairPosition,
                ];

                switch (sliceType) {
                  case "sagittal":
                    newPosition[0] = newIndex;
                    break;
                  case "coronal":
                    newPosition[1] = newIndex;
                    break;
                  case "axial":
                  default:
                    newPosition[2] = newIndex;
                    break;
                }

                onCrosshairPositionChange(newPosition);
              }
            }}
            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[8px] text-gray-500 mt-0.5">
            <span>0</span>
            <span>{getMaxSliceIndex()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
