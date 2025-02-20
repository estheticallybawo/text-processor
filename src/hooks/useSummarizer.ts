// hooks/useSummarizer.ts
"use client";

import { useState, useEffect } from 'react';

export function useSummarizer() {
  const [summarizer, setSummarizer] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'downloading' | 'ready' | 'unavailable'>('loading');
  const [downloadProgress, setDownloadProgress] = useState(0);

  const summarizeText = async (text: string) => {
    if (!summarizer || status !== 'ready') {
      throw new Error('Summarizer not ready');
    }
    return await summarizer.summarize(text);
  };

  useEffect(() => {
    const initializeSummarizer = async () => {
      try {
        if (!('ai' in window)) {
          setStatus('unavailable');
          return;
        }

        const ai = (window as any).ai;
        if (!ai?.summarizer) {
          setStatus('unavailable');
          return;
        }

        // Check capabilities
        const capabilities = await ai.summarizer.capabilities();
        if (capabilities.available === 'no') {
          setStatus('unavailable');
          return;
        }

        // Create summarizer instance
        const instance = await ai.summarizer.create({
          sharedContext: 'General text processing',
          type: 'key-points',
          format: 'markdown',
          length: 'medium',
        });

        // Handle model download
        if (capabilities.available === 'after-download') {
          setStatus('downloading');
          instance.addEventListener('downloadprogress', (event: any) => {
            const progress = (event.loaded / event.total) * 100;
            setDownloadProgress(progress);
            console.log(`Downloaded ${event.loaded} of ${event.total} bytes (${progress.toFixed(2)}%)`);
          });
          await instance.ready;
        }

        setSummarizer(instance);
        setStatus('ready');
      } catch (error) {
        console.error('Summarizer initialization failed:', error);
        setStatus('unavailable');
      }
    };

    initializeSummarizer();
  }, []);

  return { summarizeText, status, downloadProgress };
}
