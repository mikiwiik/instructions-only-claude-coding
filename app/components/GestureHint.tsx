import { Info, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const GESTURE_HINT_KEY = 'gesture-hints-dismissed';

export default function GestureHint() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the hint
    const dismissed = localStorage.getItem(GESTURE_HINT_KEY);
    if (!dismissed) {
      // Show hint after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(GESTURE_HINT_KEY, 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className='fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg fade-in z-50'
      role='alert'
      aria-live='polite'
    >
      <div className='flex items-start gap-3'>
        <Info className='h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5' />
        <div className='flex-1 text-sm'>
          <h3 className='font-semibold text-blue-900 mb-2'>
            Touch Gestures Available
          </h3>
          <ul className='space-y-1 text-blue-800'>
            <li>
              <strong>Swipe right:</strong> Mark todo as complete
            </li>
            <li>
              <strong>Swipe left:</strong> Delete todo
            </li>
            <li>
              <strong>Long press:</strong> Enter edit mode
            </li>
          </ul>
          <p className='mt-2 text-xs text-blue-700'>
            All actions are also available via buttons for accessibility.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className='flex-shrink-0 p-1 rounded hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
          aria-label='Dismiss gesture hints'
          type='button'
        >
          <X className='h-4 w-4 text-blue-600' />
        </button>
      </div>
    </div>
  );
}
