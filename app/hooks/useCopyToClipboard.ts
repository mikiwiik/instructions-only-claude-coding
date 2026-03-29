import { useState, useRef, useEffect, useCallback } from 'react';
import { copyToClipboard } from '../lib/list-manager';

export function useCopyToClipboard(text: string) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const copy = useCallback(async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }
    return success;
  }, [text]);

  return { copied, copy };
}
