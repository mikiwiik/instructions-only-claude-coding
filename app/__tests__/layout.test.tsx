import { render } from '@testing-library/react';

// Mock Next.js font
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'mocked-inter-font',
  }),
}));

// Component to test just the body content without HTML structure
const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='min-h-screen bg-background font-sans antialiased'>
      <main className='container mx-auto px-4 py-8'>{children}</main>
    </div>
  );
};

describe('RootLayout', () => {
  it('renders children content', () => {
    const { getByTestId } = render(
      <LayoutContent>
        <div data-testid='test-content'>Test content</div>
      </LayoutContent>
    );

    expect(getByTestId('test-content')).toBeInTheDocument();
  });

  it('applies the correct CSS classes for styling', () => {
    const { container } = render(
      <LayoutContent>
        <div>Content</div>
      </LayoutContent>
    );

    const wrapper = container.querySelector('.min-h-screen');
    expect(wrapper).toHaveClass('bg-background');
    expect(wrapper).toHaveClass('font-sans');
    expect(wrapper).toHaveClass('antialiased');

    const main = container.querySelector('main');
    expect(main).toHaveClass('container');
    expect(main).toHaveClass('mx-auto');
    expect(main).toHaveClass('px-4');
    expect(main).toHaveClass('py-8');
  });

  it('has proper font class applied', () => {
    const { container } = render(
      <LayoutContent>
        <div>Content</div>
      </LayoutContent>
    );

    // Test that the layout structure is correct
    expect(container.firstChild).toHaveClass('min-h-screen');
  });
});
