import { CheckSquare } from 'lucide-react';

export default function HomePage() {
  return (
    <div className='max-w-4xl mx-auto'>
      <header className='text-center mb-8'>
        <div className='flex items-center justify-center gap-3 mb-4'>
          <CheckSquare className='h-8 w-8 text-primary' />
          <h1 className='text-4xl font-bold text-foreground'>Todo App</h1>
        </div>
        <p className='text-muted-foreground text-lg'>
          A Next.js Todo application built with Test-Driven Development
        </p>
        <p className='text-muted-foreground text-sm mt-2'>
          Powered by Claude Code
        </p>
      </header>

      <div className='bg-card border rounded-lg p-6 shadow-sm'>
        <h2 className='text-2xl font-semibold mb-4 text-card-foreground'>
          Coming Soon
        </h2>
        <div className='space-y-3 text-muted-foreground'>
          <p>🚀 This Todo app is currently under development using:</p>
          <ul className='list-disc list-inside space-y-2 ml-4'>
            <li>Next.js 14 with App Router</li>
            <li>TypeScript for type safety</li>
            <li>Tailwind CSS for styling</li>
            <li>Test-Driven Development (TDD)</li>
            <li>Jest & React Testing Library</li>
            <li>localStorage for data persistence</li>
          </ul>
          <p className='pt-4'>
            Stay tuned as we build this app step by step with comprehensive
            testing!
          </p>
        </div>
      </div>

      <footer className='text-center mt-8 text-sm text-muted-foreground'>
        <p>
          Built with ❤️ using{' '}
          <a
            href='https://claude.ai/code'
            className='text-primary hover:underline'
            target='_blank'
            rel='noopener noreferrer'
          >
            Claude Code
          </a>
        </p>
      </footer>
    </div>
  );
}
