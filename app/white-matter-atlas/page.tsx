import { Metadata } from "next";
import BrainViewerClient from "@/components/brain/BrainViewerClient";

export const metadata: Metadata = {
  title: "Tract Atlas - TonKurA",
  description: "脳の白質線維を詳細に解説するアトラスページ",
};

export default function TractAtlasPage() {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-4xl font-bold mb-6">Tract Atlas</h1>

      <div className="mb-8">
        <p className="text-lg text-gray-700 mb-4">
          このページでは、Human Connectome
          Project（HCP）の平均トラクトグラフィーデータを使用して、脳の白質線維を詳細に可視化しています。
        </p>
        <p className="text-lg text-gray-700 mb-4">
          提示されているトラクトは、投射線維、連合線維、交連線維など、脳の主要な白質経路を網羅しています。
          カテゴリと表示したいトラクトを選択することで、様々な白質線維を詳細に観察できます。
        </p>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            <span>新機能: 皮質アトラスと白質線維の同時表示</span>
            <span className="ml-2 text-xs bg-blue-100 px-2 py-0.5 rounded text-blue-700 font-semibold">
              NEW
            </span>
          </h2>
          <p className="text-md text-gray-700">
            白質線維表示時に「HCP-MMP1皮質アトラスを同時表示」オプションをオンにすると、
            白質線維と皮質領域を同時に可視化できるようになりました。
            これにより、各白質線維束が脳のどの皮質領域とつながっているかを直感的に理解できます。
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            <span>新機能: 特定の皮質領域のみを選択して表示</span>
            <span className="ml-2 text-xs bg-green-100 px-2 py-0.5 rounded text-green-700 font-semibold">
              NEW
            </span>
          </h2>
          <p className="text-md text-gray-700 mb-2">
            「特定の皮質領域だけを表示」オプションをオンにすると、
            関心のある皮質領域だけを選択して表示できるようになりました。
            これにより、特定の白質線維束と特定の皮質領域の関係をより詳細に観察できます。
          </p>
          <div className="text-sm bg-white p-3 rounded border border-green-100">
            <p className="font-semibold mb-1">使い方：</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>白質線維を選択する（例：弓状束）</li>
              <li>「HCP-MMP1皮質アトラスを同時表示」をオンにする</li>
              <li>「特定の皮質領域だけを表示」をオンにする</li>
              <li>
                表示される領域選択パネルから関心のある皮質領域を選択する（例：言語関連領域）
              </li>
              <li>選択した白質線維と皮質領域の関係を観察する</li>
            </ol>
          </div>
        </div>
      </div>

      <BrainViewerClient
        initialAtlasType="tract"
        title="HCP白質線維アトラス"
        hideTabInterface={true}
      />

      <div className="mt-8 bg-green-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">
          HCP白質線維アトラスについて
        </h2>
        <p className="mb-4">
          このアトラスは、Human Connectome
          Project（HCP）の1065人の平均トラクトグラフィーデータに基づいています。
          複数の拡散テンソル画像（DTI）を統合し、脳の主要な白質線維経路を高精細に可視化しています。
        </p>
        <p className="mb-4">このアトラスの特徴：</p>
        <ul className="list-disc pl-8 mb-4 space-y-2">
          <li>投射線維、連合線維、交連線維を含む</li>
          <li>左右半球の線維経路を同時に表示</li>
          <li>高解像度の平均トラクトグラフィーデータ</li>
          <li>神経解剖学的研究に革新的なアプローチ</li>
          <li>カテゴリとトラクトを選択して詳細に観察可能</li>
          <li>左右両方の同じトラクトを同時に表示して比較可能</li>
        </ul>
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">トラクトカテゴリ</h3>
          <ul className="list-disc pl-8 space-y-1">
            <li>
              <span className="font-medium">投射線維 (Projection fibers)</span>:
              大脳皮質と皮質下構造を結ぶ線維
            </li>
            <li>
              <span className="font-medium">連合線維 (Association fibers)</span>
              : 同一半球内の皮質領域を結ぶ線維
            </li>
            <li>
              <span className="font-medium">交連線維 (Commissural fibers)</span>
              : 左右の大脳半球を結ぶ線維
            </li>
            <li>
              <span className="font-medium">脳神経 (Cranial nerves)</span>:
              脳から直接出入りする末梢神経
            </li>
            <li>
              <span className="font-medium">小脳線維 (Cerebellar fibers)</span>:
              小脳に関連する線維経路
            </li>
          </ul>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">使用方法</h3>
          <ul className="list-disc pl-8 space-y-1">
            <li>
              <span className="font-medium">トラクト選択</span>:
              右側のリストから観察したいトラクトを選択します
            </li>
            <li>
              <span className="font-medium">左右同時表示</span>:
              トラクトを選択すると、左右両方の線維が同時に表示されます
            </li>
            <li>
              <span className="font-medium">表示切り替え</span>: 「アトラス表示
              ON/OFF」スイッチでトラクト表示のオン/オフを切り替えられます
            </li>
          </ul>
        </div>
        <p>
          <a
            href="https://www.humanconnectome.org/"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Human Connectome Projectの公式サイト
          </a>
        </p>
      </div>
    </div>
  );
}
