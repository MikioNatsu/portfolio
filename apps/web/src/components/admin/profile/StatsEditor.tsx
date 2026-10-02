import type { ProfileStat } from '@natsu/types';
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import { Panel } from '../Card';
import { IconButton } from '../IconButton';
import { SortableList } from '../SortableList';

const STAT_ICONS = [
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'heart', label: 'Heart' },
  { value: 'layers', label: 'Layers' },
  { value: 'zap', label: 'Zap' },
  { value: 'star', label: 'Star' },
  { value: 'briefcase', label: 'Briefcase' },
  { value: 'users', label: 'Users' },
];

/** Editable, drag-sortable list of profile statistics (saved with the form). */
export function StatsEditor({
  stats,
  onChange,
}: {
  stats: ProfileStat[];
  onChange: (stats: ProfileStat[]) => void;
}) {
  const patch = (id: string, changes: Partial<ProfileStat>) =>
    onChange(stats.map((stat) => (stat.id === id ? { ...stat, ...changes } : stat)));

  const add = () =>
    onChange([
      ...stats,
      {
        id: `new-${Date.now()}`,
        label: '',
        value: '',
        suffix: null,
        icon: 'sparkles',
        order: stats.length,
        published: true,
      },
    ]);

  return (
    <Panel
      title="Statistics"
      description="Only publish numbers you can stand behind. Remove a statistic and it disappears from the site."
      padded={false}
      actions={
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={add}
          iconLeft={<Plus className="h-4 w-4" />}
        >
          Add
        </Button>
      }
    >
      {stats.length === 0 ? (
        <p className="px-5 pb-5 text-[13px] text-sys-secondary">No statistics configured.</p>
      ) : (
        <SortableList
          items={stats}
          getKey={(stat) => stat.id}
          getLabel={(stat) => stat.label || 'statistic'}
          onChange={onChange}
          itemClassName="border-t border-sys-separator"
          renderItem={(stat, handle) => (
            <div className="flex items-start gap-2 px-3 py-3.5 sm:pr-4">
              <span className="pt-7">{handle}</span>
              <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[1.4fr_0.8fr_0.6fr_1fr]">
                <Input
                  label="Label"
                  value={stat.label}
                  onChange={(event) => patch(stat.id, { label: event.target.value })}
                  placeholder="Projects shipped"
                />
                <Input
                  label="Value"
                  value={stat.value}
                  onChange={(event) => patch(stat.id, { value: event.target.value })}
                />
                <Input
                  label="Suffix"
                  value={stat.suffix ?? ''}
                  onChange={(event) => patch(stat.id, { suffix: event.target.value || null })}
                  placeholder="+"
                />
                <Select
                  label="Icon"
                  value={stat.icon ?? 'sparkles'}
                  onChange={(event) => patch(stat.id, { icon: event.target.value })}
                  options={STAT_ICONS}
                />
              </div>
              <div className="flex shrink-0 flex-col items-center gap-0.5 pt-6 sm:flex-row">
                <IconButton
                  label="Show on site"
                  icon={stat.published ? Eye : EyeOff}
                  aria-pressed={stat.published}
                  tone={stat.published ? 'accent' : 'default'}
                  onClick={() => patch(stat.id, { published: !stat.published })}
                />
                <IconButton
                  label={`Remove ${stat.label || 'statistic'}`}
                  icon={Trash2}
                  tone="danger"
                  onClick={() => onChange(stats.filter((entry) => entry.id !== stat.id))}
                />
              </div>
            </div>
          )}
        />
      )}
    </Panel>
  );
}
