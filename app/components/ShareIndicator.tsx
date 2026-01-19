'use client';

import { useState, useCallback } from 'react';
import { Link2, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../lib/list-manager';

export interface ShareIndicatorProps {
  /** The shareable URL to display */
  shareUrl: string;
}

export default function ShareIndicator({
  shareUrl,
}: Readonly<ShareIndicatorProps>) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  return (
    <div
      className='flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg px-3 py-2'
      role='status'
      aria-label='Shared list indicator'
    >
      <Link2
        className='h-4 w-4 text-blue-600 flex-shrink-0'
        aria-hidden='true'
      />
      <span className='text-blue-800 font-medium'>Shared</span>
      <button
        onClick={handleCopy}
        className='ml-auto flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors min-w-[44px] min-h-[44px] justify-center'
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
            <span className='text-blue-700 text-xs hidden sm:inline'>
              Copy URL
            </span>
          </>
        )}
      </button>
    </div>
  );
}
