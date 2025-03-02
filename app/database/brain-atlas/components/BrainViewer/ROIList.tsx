'use client';

import { useState, useEffect, useMemo } from 'react';

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

interface ROIGroup {
  type: string;
  name: string;
  color: string;
  rois: ROI[];
}

interface ROIListProps {
  selectedROIs: number[];
  onToggleROI: (roi: ROI) => void;
  searchTerm: string;
}

const REGION_TYPES = {
  'Frontal': '前頭葉',
  'Parietal': '頭頂葉',
  'Temporal': '側頭葉',
  'Occipital': '後頭葉',
  'Limbic': '辺縁系',
  'Sub_Cortical': '皮質下',
  'Cerebellum': '小脳'
};

export default function ROIList({ selectedROIs, onToggleROI, searchTerm }: ROIListProps) {
  const [rois, setRois] = useState<ROI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ROIデータの取得
  useEffect(() => {
    fetch('/data/brain/roi_info.json')
      .then(res => {
        if (!res.ok) throw new Error('ROIデータの取得に失敗しました');
        return res.json();
      })
      .then(data => {
        setRois(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);
  
  // ROIをグループ化
  const groupedROIs = useMemo(() => {
    const groups = new Map<string, ROI[]>();
    
    // グループの初期化
    Object.keys(REGION_TYPES).forEach(type => {
      groups.set(type, []);
    });
    
    // ROIをグループに分類
    rois.forEach(roi => {
      const group = groups.get(roi.region_type) || [];
      group.push(roi);
      groups.set(roi.region_type, group);
    });
    
    // グループをソート
    return Array.from(groups.entries())
      .map(([type, rois]) => ({
        type,
        name: REGION_TYPES[type as keyof typeof REGION_TYPES],
        color: rois[0]?.color || '#808080',
        rois: rois.sort((a, b) => a.name_ja.localeCompare(b.name_ja))
      }))
      .filter(group => group.rois.length > 0);
  }, [rois]);
  
  // 検索フィルタリング
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedROIs;
    
    const term = searchTerm.toLowerCase();
    return groupedROIs
      .map(group => ({
        ...group,
        rois: group.rois.filter(roi => 
          roi.name_ja.toLowerCase().includes(term) ||
          roi.name.toLowerCase().includes(term)
        )
      }))
      .filter(group => group.rois.length > 0);
  }, [groupedROIs, searchTerm]);
  
  // 選択されたROIを上部に固定表示
  const selectedROIsList = useMemo(() => {
    return rois.filter(roi => selectedROIs.includes(roi.id));
  }, [rois, selectedROIs]);
  
  if (loading) {
    return <div className="p-4 text-center">読み込み中...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* 選択されたROI */}
      {selectedROIsList.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">選択中の領域</h3>
          <div className="space-y-1 bg-gray-50 p-2 rounded">
            {selectedROIsList.map(roi => (
              <ROIListItem
                key={roi.id}
                roi={roi}
                isSelected={true}
                onClick={() => onToggleROI(roi)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* グループ化されたROIリスト */}
      <div className="flex-1 overflow-auto">
        {filteredGroups.map(group => (
          <div key={group.type} className="mb-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center">
              <span
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: group.color }}
              />
              {group.name}
            </h3>
            <div className="space-y-1">
              {group.rois.map(roi => (
                <ROIListItem
                  key={roi.id}
                  roi={roi}
                  isSelected={selectedROIs.includes(roi.id)}
                  onClick={() => onToggleROI(roi)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ROIリストアイテムコンポーネント
const ROIListItem = ({ 
  roi, 
  isSelected, 
  onClick 
}: { 
  roi: ROI; 
  isSelected: boolean; 
  onClick: () => void; 
}) => (
  <div
    className={`
      p-2 rounded cursor-pointer transition-colors
      ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'}
    `}
    style={{
      borderLeft: `4px solid ${roi.color}`,
    }}
    onClick={onClick}
  >
    <div className="font-medium">{roi.name_ja}</div>
  </div>
); 