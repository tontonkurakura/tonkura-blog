"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BrainSliceViewer from "@/components/brain/BrainSliceViewer";
import BrainRegionList from "@/components/brain/BrainRegionList";
import { loadAALLabels, loadAALJapaneseLabelsJson } from "@/utils/niftiUtils";

// AALラベルの型定義
interface AALLabel {
  index: number;
  name: string;
  color: string;
}

// 日本語ラベルの型定義
interface AALJapaneseLabel {
  englishLabel: string;
  japaneseLabel: string;
  laterality: string;
  category: string;
}

export default function BrainDatabasePage() {
  const [activeTab, setActiveTab] = useState<'viewer' | 'about'>('viewer');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aalLabels, setAalLabels] = useState<AALLabel[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [showAAL, setShowAAL] = useState(true); // AAL表示の状態を管理
  const [japaneseLabels, setJapaneseLabels] = useState<Record<string, string>>({});
  const [japaneseLabelsData, setJapaneseLabelsData] = useState<AALJapaneseLabel[]>([]);

  // AALラベルの読み込み
  useEffect(() => {
    const loadLabels = async () => {
      try {
        const labels = await loadAALLabels('/data/brain/AAL3v1.nii.txt');
        setAalLabels(labels);
        
        // 日本語ラベルの読み込み（JSONファイルから）
        const japLabelsData = await loadAALJapaneseLabelsJson('/data/brain/AAL3_Jap.json');
        setJapaneseLabelsData(japLabelsData);
        
        // 後方互換性のために従来の形式のマッピングも作成
        const japLabelsMap: Record<string, string> = {};
        japLabelsData.forEach(item => {
          const fullLabel = item.laterality ? `${item.japaneseLabel} ${item.laterality}` : item.japaneseLabel;
          japLabelsMap[item.englishLabel] = fullLabel;
        });
        setJapaneseLabels(japLabelsMap);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading AAL labels:', err);
        setError('AALラベルの読み込み中にエラーが発生しました。');
        setIsLoading(false);
      }
    };
    
    loadLabels();
  }, []);
  
  // 領域選択ハンドラ
  const handleRegionSelect = (regionIndex: number | null) => {
    // 同じ領域が選択された場合は選択解除
    if (selectedRegion === regionIndex) {
      setSelectedRegion(null);
    } else {
      setSelectedRegion(regionIndex);
    }
  };

  // AAL表示切り替えハンドラ
  const handleToggleAAL = () => {
    setShowAAL(!showAAL);
  };

  // 英語名から日本語名を取得する関数
  // 現在は直接使用されていませんが、将来的に必要になる可能性があるため残しています
  /* 
  const getJapaneseName = (englishName: string): string => {
    // JSONデータから検索
    const labelData = japaneseLabelsData.find(item => item.englishLabel === englishName);
    if (labelData) {
      return labelData.japaneseLabel;
    }
    
    // 見つからない場合はカテゴリ名を返す
    const lowerName = englishName.toLowerCase();
    if (lowerName.includes('frontal')) return '前頭葉領域';
    if (lowerName.includes('temporal')) return '側頭葉領域';
    if (lowerName.includes('parietal')) return '頭頂葉領域';
    if (lowerName.includes('occipital')) return '後頭葉領域';
    if (lowerName.includes('cerebellum')) return '小脳領域';
    if (lowerName.includes('cingulate')) return '帯状回領域';
    if (lowerName.includes('insula')) return '島皮質領域';
    if (lowerName.includes('thalamus')) return '視床領域';
    
    return '脳領域';
  };
  */

  // 英語名から左右の接頭辞付き日本語名を取得する関数
  const getJapaneseNameWithPrefix = (englishName: string): string => {
    // JSONデータから検索
    const labelData = japaneseLabelsData.find(item => item.englishLabel === englishName);
    
    if (labelData) {
      // lateralityが存在する場合は接頭辞として追加
      if (labelData.laterality) {
        return labelData.laterality + labelData.japaneseLabel;
      }
      return labelData.japaneseLabel;
    }
    
    // 見つからない場合はカテゴリ名を返す
    const lowerName = englishName.toLowerCase();
    if (lowerName.includes('frontal')) return '前頭葉領域';
    if (lowerName.includes('temporal')) return '側頭葉領域';
    if (lowerName.includes('parietal')) return '頭頂葉領域';
    if (lowerName.includes('occipital')) return '後頭葉領域';
    if (lowerName.includes('cerebellum')) return '小脳領域';
    if (lowerName.includes('cingulate')) return '帯状回領域';
    if (lowerName.includes('insula')) return '島皮質領域';
    if (lowerName.includes('thalamus')) return '視床領域';
    
    return '脳領域';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/database"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          データベース一覧に戻る
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">脳機能データベース</h1>
      
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 ${activeTab === 'viewer' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('viewer')}
          >
            ビューワー
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'about' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('about')}
          >
            データについて
          </button>
        </div>
      </div>
      
      {activeTab === 'viewer' ? (
        <div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                <p>データを読み込み中...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p className="font-bold">エラー</p>
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                  <h2 className="text-xl font-semibold mb-4">3Dビューワー</h2>
                  <div className="border rounded-md">
                    <div className="h-[400px] w-full flex items-center justify-center bg-gray-100">
                      <p className="text-gray-500">3Dビューワーは現在開発中です</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h2 className="text-xl font-semibold mb-4">断面ビューワー</h2>
                  
                  {/* AAL表示切り替えボタンを共通で1箇所に配置 */}
                  <div className="mb-4 flex justify-end">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showAAL}
                        onChange={handleToggleAAL}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-2 text-sm font-medium">AAL領域表示</span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-md">
                      <BrainSliceViewer
                        mniUrl="/data/brain/MNI152_1mm_brain.nii.gz"
                        aalUrl="/data/brain/AAL3v1_1mm.nii.gz"
                        aalLabels={aalLabels}
                        selectedRegion={selectedRegion}
                        sliceType="axial"
                        onRegionClick={handleRegionSelect}
                        showAAL={showAAL}
                        japaneseLabelsData={japaneseLabelsData}
                      />
                    </div>
                    <div className="border rounded-md">
                      <BrainSliceViewer
                        mniUrl="/data/brain/MNI152_1mm_brain.nii.gz"
                        aalUrl="/data/brain/AAL3v1_1mm.nii.gz"
                        aalLabels={aalLabels}
                        selectedRegion={selectedRegion}
                        sliceType="coronal"
                        onRegionClick={handleRegionSelect}
                        showAAL={showAAL}
                        japaneseLabelsData={japaneseLabelsData}
                      />
                    </div>
                    <div className="border rounded-md">
                      <BrainSliceViewer
                        mniUrl="/data/brain/MNI152_1mm_brain.nii.gz"
                        aalUrl="/data/brain/AAL3v1_1mm.nii.gz"
                        aalLabels={aalLabels}
                        selectedRegion={selectedRegion}
                        sliceType="sagittal"
                        onRegionClick={handleRegionSelect}
                        showAAL={showAAL}
                        japaneseLabelsData={japaneseLabelsData}
                      />
                    </div>
                  </div>
                  
                  {/* 選択された領域の情報表示 - 断面ビューワーの下に共通で1つだけ配置 */}
                  {selectedRegion && (
                    <div className="mt-6 p-4 bg-white border border-blue-300 rounded-md shadow-md">
                      {/* 領域名を日本語で大きく表示し、英語名も併記 */}
                      <h3 className="font-bold text-2xl text-blue-700 mb-1">
                        {(() => {
                          const selectedLabel = aalLabels.find(l => l.index === selectedRegion);
                          const name = selectedLabel?.name || '';
                          
                          // CSVから読み込んだ日本語名を使用
                          return getJapaneseNameWithPrefix(name);
                        })()}
                      </h3>
                      <p className="text-md text-gray-600 mb-3">
                        {aalLabels.find(l => l.index === selectedRegion)?.name || `Region ${selectedRegion}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4 h-full">
                <h2 className="text-xl font-semibold mb-4">脳領域情報</h2>
                <div className="h-[600px]">
                  <BrainRegionList
                    regions={aalLabels}
                    selectedRegion={selectedRegion}
                    onRegionSelect={handleRegionSelect}
                    japaneseLabels={japaneseLabels}
                    japaneseLabelsData={japaneseLabelsData}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4">
            <p className="font-bold">更新情報</p>
            <p>AAL領域の表示機能が有効になりました。断面ビューワーで常に脳領域が表示されるようになりました。3Dビューワーは現在開発中のため一時的に無効化しています。</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">脳機能データベースについて</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">MNI152標準脳テンプレート</h3>
            <p className="mb-2">
              MNI152は、モントリオール神経学研究所（Montreal Neurological Institute）で開発された標準脳テンプレートです。
              152人の健常者の脳MRIを平均化して作成されており、脳画像研究における標準的な座標系として広く使用されています。
            </p>
            <p>
              このテンプレートを使用することで、異なる個人間や研究間での脳領域の位置を統一的に参照することが可能になります。
              1mm等方性の高解像度バージョンを使用しており、詳細な解剖学的構造を確認できます。
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">AAL3パーセレーション</h3>
            <p className="mb-2">
              AAL（Automated Anatomical Labeling）は、脳の解剖学的領域を自動的にラベル付けするためのアトラスです。
              AAL3は最新バージョンで、脳の皮質および皮質下構造を170の領域に分割しています。
            </p>
            <p>
              各領域には固有の番号とラベル名が付けられており、脳機能研究や神経科学研究において広く使用されています。
              このデータベースでは、AAL3アトラスを使用して脳領域を視覚化し、各領域の解剖学的位置を確認できます。
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">データソース</h3>
            <p className="mb-2">
              MNI152テンプレートとAAL3アトラスは、研究目的で公開されているデータを使用しています。
              詳細な情報や原著論文については、以下の参考文献を参照してください。
            </p>
            <ul className="list-disc pl-6">
              <li>
                Fonov V, Evans AC, Botteron K, Almli CR, McKinstry RC, Collins DL. 
                Unbiased average age-appropriate atlases for pediatric studies. 
                NeuroImage, 54(1):313-327, 2011.
              </li>
              <li>
                Rolls ET, Huang CC, Lin CP, Feng J, Joliot M. 
                Automated anatomical labelling atlas 3. 
                NeuroImage, 206:116189, 2020.
              </li>
            </ul>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500">
            <p className="font-bold">開発状況</p>
            <p>現在、3Dビューワー機能は開発中のため一時的に無効化しています。今後のアップデートで実装予定です。</p>
          </div>
        </div>
      )}
    </div>
  );
}