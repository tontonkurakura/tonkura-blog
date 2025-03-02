'use client';

import BrainViewer from './components/BrainViewer';

export default function BrainAtlasPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">脳機能データベース</h1>
      <BrainViewer />
    </div>
  );
} 