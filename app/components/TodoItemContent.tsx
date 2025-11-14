import { Check, X as Cancel } from 'lucide-react';
import { RefObject } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Todo } from '../types/todo';
import { getContextualTimestamp, getFullTimestamp } from '../utils/timestamp';
import {
  hasMarkdownSyntax,
  sanitizeMarkdown,
  markdownConfig,
} from '../utils/markdown';
import MarkdownHelpBox from './MarkdownHelpBox';

interface TodoItemContentProps {
  todo: Todo;
  isEditing: boolean;
  editText: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onEditTextChange: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * Renders the content area of a todo item (display or edit mode)
 * Cognitive complexity: ≤8
 */
export default function TodoItemContent({
  todo,
  isEditing,
  editText,
  textareaRef,
  onEditTextChange,
  onSave,
  onCancel,
  onKeyDown,
}: TodoItemContentProps) {
  if (isEditing) {
    return (
      <div className='space-y-3'>
        <textarea
          ref={textareaRef}
          value={editText}
          onChange={(e) => onEditTextChange(e.target.value)}
          onKeyDown={onKeyDown}
          className='w-full text-base bg-background border border-border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring resize-none overflow-hidden min-h-[2.5rem]'
          aria-label='Edit todo text'
          rows={1}
          placeholder='Enter your todo text... (Markdown formatting supported)'
        />
        <MarkdownHelpBox className='mt-2' />
        <div className='flex gap-1 md:gap-2'>
          <button
            onClick={onSave}
            className='flex-shrink-0 p-1.5 md:p-2 rounded hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-muted-foreground hover:text-green-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
            aria-label='Save edit'
            type='button'
          >
            <Check className='h-4 w-4' />
          </button>
          <button
            onClick={onCancel}
            className='flex-shrink-0 p-1.5 md:p-2 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-muted-foreground hover:text-red-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
            aria-label='Cancel edit'
            type='button'
          >
            <Cancel className='h-4 w-4' />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`text-sm md:text-base leading-relaxed break-words ${
          todo.completedAt
            ? 'line-through text-muted-foreground'
            : 'text-foreground'
        }`}
      >
        {hasMarkdownSyntax(todo.text) ? (
          <div data-testid='markdown-content'>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={markdownConfig.components}
              disallowedElements={markdownConfig.disallowedElements}
              unwrapDisallowed={markdownConfig.unwrapDisallowed}
            >
              {sanitizeMarkdown(todo.text)}
            </ReactMarkdown>
          </div>
        ) : (
          <p className='whitespace-pre-line'>{sanitizeMarkdown(todo.text)}</p>
        )}
      </div>
      <p
        className='text-xs text-muted-foreground mt-1 md:mt-2'
        title={getFullTimestamp(todo)}
      >
        {getContextualTimestamp(todo)}
      </p>
    </>
  );
}
