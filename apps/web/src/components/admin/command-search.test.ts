import { describe, expect, it } from 'vitest';
import { scoreItem, searchCommands, type Searchable } from './command-search';

const items: Searchable[] = [
  { label: 'Overview', group: 'Pages', keywords: ['dashboard'] },
  { label: 'Projects', group: 'Pages' },
  { label: 'New project', group: 'Actions', keywords: ['create'] },
  { label: 'Tensei.uz', group: 'Projects', keywords: ['tensei-uz', 'Anime Platform'] },
  { label: 'Sign out', group: 'Actions', keywords: ['log out'] },
];

describe('scoreItem', () => {
  it('ranks exact > prefix > word prefix > substring > keyword > fuzzy', () => {
    expect(scoreItem(items[1]!, 'projects')).toBe(100);
    expect(scoreItem(items[1]!, 'proj')).toBe(80);
    expect(scoreItem(items[2]!, 'proj')).toBe(60);
    expect(scoreItem(items[0]!, 'view')).toBe(45);
    expect(scoreItem(items[0]!, 'dash')).toBe(35);
    expect(scoreItem(items[3]!, 'platform')).toBe(25);
    expect(scoreItem(items[4]!, 'sgnt')).toBe(10);
    expect(scoreItem(items[4]!, 'zzz')).toBe(0);
  });

  it('treats an empty query as a match for everything', () => {
    expect(scoreItem(items[0]!, '   ')).toBe(1);
  });
});

describe('searchCommands', () => {
  it('drops non-matches and groups results by their best hit', () => {
    const groups = searchCommands(items, 'proj');
    expect(groups.map((group) => group.group)).toEqual(['Pages', 'Actions']);
    expect(groups[0]!.items.map((item) => item.label)).toEqual(['Projects']);
    expect(groups[1]!.items.map((item) => item.label)).toEqual(['New project']);
  });

  it('keeps the original order for an empty query', () => {
    const labels = searchCommands(items, '').flatMap((group) => group.items.map((i) => i.label));
    expect(labels).toEqual(['Overview', 'Projects', 'New project', 'Sign out', 'Tensei.uz']);
  });

  it('respects the limit', () => {
    expect(searchCommands(items, '', 2).flatMap((group) => group.items)).toHaveLength(2);
  });
});
