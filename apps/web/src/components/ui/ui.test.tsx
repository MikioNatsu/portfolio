import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SmartImage } from '@/components/ui/SmartImage';
import { Badge, ProjectStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

describe('SmartImage', () => {
  it('renders generated artwork when no source is provided', () => {
    render(<SmartImage src={null} alt="Tensei.uz cover" label="Tensei.uz" />);
    // No <img> is mounted at all — the placeholder keeps the layout stable.
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('TE')).toBeInTheDocument();
  });

  it('renders the real image when a source exists', () => {
    render(<SmartImage src="/uploads/cover.webp" alt="Tensei.uz cover" />);
    const image = screen.getByAltText('Tensei.uz cover');
    expect(image).toHaveAttribute('src', '/uploads/cover.webp');
    expect(image).toHaveAttribute('loading', 'lazy');
  });
});

describe('ProjectStatusBadge', () => {
  it('labels each status', () => {
    const { rerender } = render(<ProjectStatusBadge status="PUBLISHED" />);
    expect(screen.getByText('Live')).toBeInTheDocument();

    rerender(<ProjectStatusBadge status="DRAFT" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });
});

describe('Badge', () => {
  it('renders its content', () => {
    render(<Badge tone="accent">New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });
});

describe('Button', () => {
  it('renders an anchor for external links with safe rel', () => {
    render(
      <MemoryRouter>
        <Button href="https://tensei.uz">Live demo</Button>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: /live demo/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('renders an internal route link', () => {
    render(
      <MemoryRouter>
        <Button to="/projects">View work</Button>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /view work/i })).toHaveAttribute('href', '/projects');
  });

  it('is disabled while loading', () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
