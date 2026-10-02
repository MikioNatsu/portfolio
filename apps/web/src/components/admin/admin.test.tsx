import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useToast } from '@/hooks/useToast';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { SaveBar } from './SaveBar';
import { SegmentedControl } from './SegmentedControl';
import { SortableList } from './SortableList';
import { Toaster } from './Toaster';

afterEach(() => vi.useRealTimers());

describe('SegmentedControl', () => {
  const options = [
    { value: 'all', label: 'All' },
    { value: 'live', label: 'Live' },
    { value: 'draft', label: 'Drafts' },
  ] as const;

  function Harness({ onChange }: { onChange?: (value: string) => void }) {
    const [value, setValue] = useState<(typeof options)[number]['value']>('all');
    return (
      <SegmentedControl
        label="Status"
        options={options}
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange?.(next);
        }}
      />
    );
  }

  it('is a labelled radio group with one tabbable segment', () => {
    render(<Harness />);
    expect(screen.getByRole('radiogroup', { name: 'Status' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'All' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Live' })).toHaveAttribute('tabindex', '-1');
  });

  it('moves the selection with arrow keys, wrapping at the ends', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const all = screen.getByRole('radio', { name: 'All' });

    fireEvent.keyDown(all, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('live');
    expect(screen.getByRole('radio', { name: 'Live' })).toHaveAttribute('aria-checked', 'true');

    fireEvent.keyDown(screen.getByRole('radio', { name: 'Live' }), { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith('draft');

    fireEvent.keyDown(screen.getByRole('radio', { name: 'Drafts' }), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('all');
  });
});

describe('SortableList', () => {
  const initial = [
    { id: 'a', name: 'React' },
    { id: 'b', name: 'Vite' },
    { id: 'c', name: 'Prisma' },
  ];

  function Harness({ onCommit }: { onCommit: (ids: string[]) => void }) {
    const [items, setItems] = useState(initial);
    return (
      <SortableList
        items={items}
        getKey={(item) => item.id}
        getLabel={(item) => item.name}
        onChange={setItems}
        onCommit={(next) => onCommit(next.map((item) => item.id))}
        renderItem={(item, handle) => (
          <div>
            {handle}
            <span>{item.name}</span>
          </div>
        )}
      />
    );
  }

  it('reorders from the keyboard and announces the new position', () => {
    const onCommit = vi.fn();
    render(<Harness onCommit={onCommit} />);

    fireEvent.keyDown(screen.getByRole('button', { name: /Reorder React/ }), { key: 'ArrowDown' });

    expect(onCommit).toHaveBeenCalledWith(['b', 'a', 'c']);
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Vite',
      'React',
      'Prisma',
    ]);
    expect(screen.getByText('React moved to position 2 of 3.')).toBeInTheDocument();
  });

  it('ignores moves past either end', () => {
    const onCommit = vi.fn();
    render(<Harness onCommit={onCommit} />);
    fireEvent.keyDown(screen.getByRole('button', { name: /Reorder React/ }), { key: 'ArrowUp' });
    fireEvent.keyDown(screen.getByRole('button', { name: /Reorder Prisma/ }), {
      key: 'ArrowDown',
    });
    expect(onCommit).not.toHaveBeenCalled();
  });
});

describe('Toaster', () => {
  function Trigger() {
    const { toast } = useToast();
    return (
      <button type="button" onClick={() => toast({ title: 'Profile saved', duration: 60 })}>
        notify
      </button>
    );
  }

  it('shows a notification and dismisses it automatically', async () => {
    // Real timers: the exit animation runs on requestAnimationFrame.
    render(
      <Toaster>
        <Trigger />
      </Toaster>,
    );

    fireEvent.click(screen.getByText('notify'));
    expect(screen.getByRole('status')).toHaveTextContent('Profile saved');

    await waitForElementToBeRemoved(() => screen.queryByText('Profile saved'), { timeout: 2000 });
  });

  it('requires the provider', () => {
    expect(() => renderHook(() => useToast())).toThrow(/Toaster/);
  });
});

describe('SaveBar', () => {
  function Form({ dirty, onSubmit }: { dirty: boolean; onSubmit: () => void }) {
    return (
      <form
        id="demo-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <SaveBar formId="demo-form" dirty={dirty} />
      </form>
    );
  }

  it('only appears with unsaved changes', () => {
    const { rerender } = render(<Form dirty={false} onSubmit={vi.fn()} />);
    expect(screen.queryByRole('region', { name: 'Unsaved changes' })).not.toBeInTheDocument();
    rerender(<Form dirty onSubmit={vi.fn()} />);
    expect(screen.getByRole('region', { name: 'Unsaved changes' })).toBeInTheDocument();
  });

  it('submits the form with ⌘S / Ctrl+S', () => {
    const onSubmit = vi.fn();
    render(<Form dirty onSubmit={onSubmit} />);
    fireEvent.keyDown(window, { key: 's', metaKey: true });
    fireEvent.keyDown(window, { key: 'S', ctrlKey: true });
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it('submits through the Save button even though it is portaled', async () => {
    const onSubmit = vi.fn();
    render(<Form dirty onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe('useUnsavedChanges', () => {
  it('tracks edits against the last saved snapshot', () => {
    const { result, rerender } = renderHook(({ values }) => useUnsavedChanges(values), {
      initialProps: { values: { title: 'A' } },
    });
    expect(result.current.dirty).toBe(false);

    rerender({ values: { title: 'B' } });
    expect(result.current.dirty).toBe(true);

    act(() => result.current.markSaved({ title: 'B' }));
    expect(result.current.dirty).toBe(false);
    expect(result.current.saved).toEqual({ title: 'B' });
  });
});

describe('useDebouncedValue', () => {
  it('waits for the value to settle', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 200), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'ab' });
    rerender({ value: 'abc' });
    expect(result.current).toBe('a');
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('abc');
  });
});
