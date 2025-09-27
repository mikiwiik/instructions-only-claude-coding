'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { markdownExamples } from '../utils/markdown';

interface MarkdownHelpBoxProps {
  className?: string;
}

/**
 * Collapsible help component showing markdown syntax examples
 * Provides users with quick reference for markdown formatting
 */
export function MarkdownHelpBox({ className = '' }: MarkdownHelpBoxProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 ${className}`}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full flex items-center justify-between p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg'
        type='button'
        aria-expanded={isExpanded}
        aria-controls='markdown-help-content'
      >
        <div className='flex items-center gap-2'>
          <HelpCircle className='h-4 w-4 text-gray-500 dark:text-gray-400' />
          <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
            Markdown Formatting Help
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className='h-4 w-4 text-gray-500 dark:text-gray-400' />
        ) : (
          <ChevronDown className='h-4 w-4 text-gray-500 dark:text-gray-400' />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div id='markdown-help-content' className='px-3 pb-3'>
          <div className='space-y-4'>
            {markdownExamples.map((category) => (
              <div key={category.category}>
                <h4 className='text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2'>
                  {category.category}
                </h4>
                <div className='space-y-2'>
                  {category.examples.map((example, index) => (
                    <div key={index} className='flex flex-col gap-1'>
                      <div className='flex items-center justify-between'>
                        <code className='text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 font-mono'>
                          {example.syntax}
                        </code>
                        <span className='text-xs text-gray-500 dark:text-gray-400'>
                          {example.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className='mt-4 pt-3 border-t border-gray-200 dark:border-gray-600'>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Markdown formatting will be automatically detected and rendered
              when you save your todo. Plain text will continue to work as
              before.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarkdownHelpBox;
