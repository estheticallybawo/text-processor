"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SummarizerContextType {
  status: 'loading' | 'ready' | 'unavailable' | 'downloading' | 'idle' | 'summarizing' | 'success' | 'error';
  summarizer: any;
  summarizeText: (text: string) => Promise<string>;
  downloadProgress: number;
}

const SummarizerContext = createContext<SummarizerContextType>({
  status: 'loading',
  summarizer: null,
  summarizeText: async () => '',
  downloadProgress: 0,
});

export function SummarizerProvider({ children }: { children: ReactNode }) {
  const [summarizer, setSummarizer] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable' | 'downloading' | 'idle' | 'summarizing' | 'success' | 'error'>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const initializeSummarizer = async () => {
      try {
        // Check if the API is supported
        if (!('ai' in window)) throw new Error('AI API not supported');
        if (!('summarizer' in (window as any).ai)) throw new Error('Summarizer API not supported');

        // Check capabilities
        const capabilities = await (window as any).ai.summarizer.capabilities();
        if (capabilities.available === 'no') {
          setStatus('unavailable');
          return;
        }

        // Create summarizer instance
        const instance = await (window as any).ai.summarizer.create({
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
              setDownloadProgress(progress); // Update progress
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

    useEffect(() => {
      if (status === 'success' || status === 'error') {
        const timer = setTimeout(() => {
          setStatus('idle');
        }, 3000); // Reset after 3 seconds
    
        return () => clearTimeout(timer);
      }
    }, [status]);


  const summarizeText = async (text: string) => {
    if (!summarizer || status !== 'ready') throw new Error('Summarizer not ready');
    return await summarizer.summarize(text);
  };
  


  return (
    <SummarizerContext.Provider value={{ status, summarizer, summarizeText, downloadProgress }}>
      {children}
    </SummarizerContext.Provider>
  );
}

export const useSummarizer = () => useContext(SummarizerContext);