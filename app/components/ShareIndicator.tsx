'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Link2, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../lib/list-manager';

export interface ShareIndicatorProps {
  shareUrl: string;
  className?: string;
}

export default function ShareIndicator({
  shareUrl,
  className = '',
}: Readonly<ShareIndicatorProps>) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  return (
    <output
      className={`flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 ${className}`.trim()}
      aria-label='Shared list indicator'
    >
      <Link2
        className='h-4 w-4 text-blue-600 flex-shrink-0'
        aria-hidden='true'
      />
      <span className='text-blue-800 font-medium'>Shared</span>
      <button
        onClick={handleCopy}
        className='ml-auto flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors justify-center'
        style={{ minWidth: 44, minHeight: 44 }}
        type='button'
        aria-label={copied ? 'URL copied' : 'Copy share URL'}
      >
        {copied ? (
          <>
            <Check className='h-4 w-4 text-green-600' aria-hidden='true' />
            <span className='text-green-700 text-xs'>Copied!</span>
          </>
        ) : (
          <>
            <Copy className='h-4 w-4 text-blue-600' aria-hidden='true' />
            <span className='text-blue-700 text-xs'>Copy URL</span>
          </>
        )}
      </button>
    </output>
  );
}
