'use client';

import { useState } from 'react';
import { executePremiumTranslation } from '../actions/translate';

export default function TestPremiumPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    try {
      const response = await executePremiumTranslation('こんにちは、世界');
      setResult(response);
    } catch (error) {
      setResult({ error: '通信または実行エラーが発生したわ' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="font-bold text-lg mb-4 text-blue-600">プレミアム権限 サーバーアクション検証</div>
      <button 
        onClick={handleTest} 
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? '検証中...' : '翻訳アクションを実行'}
      </button>
      
      {result && (
        <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="font-bold mb-2">レスポンス結果:</div>
          <pre className="text-sm overflow-auto whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}