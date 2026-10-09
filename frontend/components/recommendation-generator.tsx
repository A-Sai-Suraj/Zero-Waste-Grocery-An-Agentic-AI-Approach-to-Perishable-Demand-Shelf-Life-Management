'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export function RecommendationGenerator() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setGenerating(true);
    setMessage(null);
    setError(null);
    try {
      const result = await apiClient.generateRecommendations();
      setMessage(result.message);
      router.refresh();
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : 'Recommendation generation failed.',
      );
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => void generate()}
        disabled={generating}
        className="rounded-full bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {generating ? 'Generating…' : 'Generate recommendations'}
      </button>
      {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
