'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import ROIList from './ROIList';
import SearchBox from './SearchBox';
import OpacityControl from './OpacityControl';
import SliceViewer from './SliceViewer';

interface ROI {
  id: number;
  name: string;
  name_ja: string;
  function: string;
  coordinates: {
    x: number;
    y: number;
    z: number;
  };
  region_type: string;
  color: string;
}

export default function BrainViewer() {
  const [selectedROIs, setSelectedROIs] = useState<number[]>([]);
  const [selectedROI, setSelectedROI] = useState<ROI | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.5);
  const [slicePositions, setSlicePositions] = useState({
    axial: 0,
    sagittal: 0,
    coronal: 0
  });
  
  // ROIの選択/解除
  const toggleROI = useCallback((roi: ROI) => {
    setSelectedROIs(prev => {
      const newSelection = prev.includes(roi.id)
        ? prev.filter(id => id !== roi.id)
        : [...prev, roi.id];
      return newSelection;
    });
    setSelectedROI(prev => prev?.id === roi.id ? null : roi);
  }, []);
  
  // 選択のクリア
  const clearSelection = useCallback(() => {
    setSelectedROIs([]);
    setSelectedROI(null);
  }, []);
  
  // スライス位置の更新
  const handleSliceUpdate = useCallback((view: string, delta: number) => {
    setSlicePositions(prev => ({
      ...prev,
      [view]: prev[view] + delta
    }));
  }, []);
  
  // メッセージイベントの処理
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'slice-update') {
        handleSliceUpdate(event.data.view, event.data.delta);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleSliceUpdate]);
  
  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
      {/* 左側：ビューア */}
      <div className="col-span-8 flex flex-col gap-4">
        {/* 3Dビューア */}
        <div className="h-2/3 bg-white rounded-lg shadow-lg overflow-hidden">
          <iframe
            src="/brain-viewers/viewer.html"
            className="w-full h-full border-0"
            title="Brain Viewer"
          />
        </div>
        
        {/* 断面図 */}
        <div className="h-1/3 grid grid-cols-3 gap-4">
          <SliceViewer
            view="axial"
            position={slicePositions.axial}
            onPositionChange={(pos) => handleSliceUpdate('axial', pos)}
          />
          <SliceViewer
            view="sagittal"
            position={slicePositions.sagittal}
            onPositionChange={(pos) => handleSliceUpdate('sagittal', pos)}
          />
          <SliceViewer
            view="coronal"
            position={slicePositions.coronal}
            onPositionChange={(pos) => handleSliceUpdate('coronal', pos)}
          />
        </div>
        
        {/* 透明度コントロール */}
        <OpacityControl
          value={backgroundOpacity}
          onChange={setBackgroundOpacity}
        />
      </div>
      
      {/* 右側：ROIリストと詳細情報 */}
      <div className="col-span-4 flex flex-col gap-4">
        {/* 検索ボックスとクリアボタン */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex gap-2">
            <SearchBox
              value={searchTerm}
              onChange={setSearchTerm}
            />
            {selectedROIs.length > 0 && (
              <button
                onClick={clearSelection}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                クリア
              </button>
            )}
          </div>
        </div>
        
        {/* ROIリスト */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-4 overflow-hidden">
          <ROIList
            selectedROIs={selectedROIs}
            onToggleROI={toggleROI}
            searchTerm={searchTerm}
          />
        </div>
        
        {/* ROI詳細情報 */}
        {selectedROI && (
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold mb-2">{selectedROI.name_ja}</h3>
            <div className="text-sm text-gray-600 mb-2">{selectedROI.name}</div>
            <div className="text-sm mb-2">
              <div className="font-medium mb-1">機能:</div>
              <div className="pl-2">{selectedROI.function}</div>
            </div>
            <div className="text-sm">
              <div className="font-medium mb-1">MNI座標:</div>
              <div className="pl-2">
                X: {selectedROI.coordinates.x.toFixed(1)},
                Y: {selectedROI.coordinates.y.toFixed(1)},
                Z: {selectedROI.coordinates.z.toFixed(1)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 