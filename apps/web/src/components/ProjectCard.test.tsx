import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ProjectSummary } from '@natsu/types';
import { ProjectCard } from './ProjectCard';

const project: ProjectSummary = {
  id: 'proj_tensei',
  title: 'Tensei.uz',
  slug: 'tensei-uz',
  category: 'Anime Platform',
  summary: 'Anime discovery, streaming and community experience focused on Uzbek users.',
  status: 'PUBLISHED',
  featured: true,
  order: 0,
  githubUrl: 'https://github.com/example/tensei',
  liveUrl: 'https://tensei.uz',
  coverImage: null,
  accentColor: '#A855F7',
  year: 2024,
  technologies: [
    { id: 't1', name: 'React', slug: 'react', icon: 'react', color: '#61DAFB' },
    { id: 't2', name: 'TypeScript', slug: 'typescript', icon: 'typescript', color: '#3178C6' },
  ],
};

function renderCard(overrides: Partial<ProjectSummary> = {}) {
  return render(
    <MemoryRouter>
      <ProjectCard project={{ ...project, ...overrides }} index={0} />
    </MemoryRouter>,
  );
}

describe('ProjectCard', () => {
  it('never nests an anchor inside another anchor', () => {
    renderCard();

    const anchors = Array.from(document.querySelectorAll('a'));
    expect(anchors.length).toBeGreaterThan(1);

    for (const anchor of anchors) {
      expect(anchor.querySelector('a')).toBeNull();
    }
  });

  it('stays valid when the project has no external links', () => {
    renderCard({ githubUrl: null, liveUrl: null });

    const anchors = Array.from(document.querySelectorAll('a'));
    expect(anchors).toHaveLength(1);
    expect(anchors[0]?.querySelector('a')).toBeNull();
  });

  it('links to the case study with the project name as its accessible name', () => {
    renderCard();

    expect(screen.getByRole('link', { name: /tensei\.uz: case study/i })).toHaveAttribute(
      'href',
      '/projects/tensei-uz',
    );
  });

  it('keeps the external links independently reachable', () => {
    renderCard();

    expect(screen.getByRole('link', { name: /source code/i })).toHaveAttribute(
      'href',
      project.githubUrl,
    );
    expect(screen.getByRole('link', { name: /live site/i })).toHaveAttribute(
      'href',
      project.liveUrl,
    );
  });

  it('opens external links safely in a new tab', () => {
    renderCard();

    for (const name of [/source code/i, /live site/i]) {
      const link = screen.getByRole('link', { name });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    }
  });

  it('renders the title, category and summary', () => {
    renderCard();

    expect(screen.getByRole('heading', { name: 'Tensei.uz' })).toBeInTheDocument();
    expect(screen.getByText('Anime Platform')).toBeInTheDocument();
    expect(screen.getByText(/anime discovery, streaming/i)).toBeInTheDocument();
  });
});
