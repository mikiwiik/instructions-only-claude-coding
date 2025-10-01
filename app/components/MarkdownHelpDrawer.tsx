'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { markdownExamples } from '../utils/markdown';

interface MarkdownHelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Bottom drawer modal for markdown help on mobile devices
 * Uses portal rendering to overlay the viewport while preserving
 * visibility of textarea and action buttons above
 */
export function MarkdownHelpDrawer({
  isOpen,
  onClose,
}: MarkdownHelpDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus trap and escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !drawerRef.current) return;

      const focusableElements = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleFocusTrap);

    // Focus first element when drawer opens
    const firstButton = drawerRef.current?.querySelector('button');
    firstButton?.focus();

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleFocusTrap);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const drawer = (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/40 z-[100] animate-fade-in'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby='markdown-help-drawer-title'
        className='fixed bottom-0 left-0 right-0 h-[45vh] bg-gray-800 dark:bg-gray-900 z-[101] rounded-t-3xl shadow-2xl animate-slide-up overflow-hidden flex flex-col'
      >
        {/* Drag Handle */}
        <div className='flex-shrink-0 flex justify-center pt-3 pb-2'>
          <div
            className='w-10 h-1 bg-gray-600 rounded-full'
            aria-hidden='true'
          />
        </div>

        {/* Header */}
        <div className='flex-shrink-0 flex items-center justify-between px-4 pb-3'>
          <h2
            id='markdown-help-drawer-title'
            className='text-base font-semibold text-gray-100'
          >
            Markdown Formatting Help
          </h2>
          <button
            onClick={onClose}
            className='p-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center'
            aria-label='Close markdown help'
            type='button'
          >
            <X className='h-5 w-5 text-gray-400' />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className='flex-1 overflow-y-auto px-4 pb-4'>
          <div className='space-y-4'>
            {markdownExamples.map((category) => (
              <div key={category.category}>
                <h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2'>
                  {category.category}
                </h3>
                <div className='space-y-2'>
                  {category.examples.map((example, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between gap-3'
                    >
                      <code className='text-xs bg-gray-900 dark:bg-black text-gray-100 px-2 py-1 rounded border border-gray-700 font-mono flex-shrink-0'>
                        {example.syntax}
                      </code>
                      <span className='text-xs text-gray-400 text-right'>
                        {example.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className='mt-4 pt-3 border-t border-gray-700'>
            <p className='text-xs text-gray-400'>
              Markdown formatting will be automatically detected and rendered
              when you save your todo. Plain text will continue to work as
              before.
            </p>
          </div>
        </div>
      </div>
    </>
  );

  // Portal to body
  return typeof document !== 'undefined'
    ? createPortal(drawer, document.body)
    : null;
}

export default MarkdownHelpDrawer;
