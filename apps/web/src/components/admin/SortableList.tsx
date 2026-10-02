import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { cn, moveItem } from '@/lib/utils';

interface SortableItemProps<T> {
  item: T;
  index: number;
  count: number;
  label: string;
  disabled?: boolean;
  className?: string;
  registerHandle: (node: HTMLButtonElement | null) => void;
  onKeyboardMove: (index: number, direction: -1 | 1) => void;
  onDragEnd: () => void;
  children: (handle: ReactNode) => ReactNode;
}

function SortableItem<T>({
  item,
  index,
  count,
  label,
  disabled,
  className,
  registerHandle,
  onKeyboardMove,
  onDragEnd,
  children,
}: SortableItemProps<T>) {
  const controls = useDragControls();

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowUp' && index > 0) {
      event.preventDefault();
      onKeyboardMove(index, -1);
    } else if (event.key === 'ArrowDown' && index < count - 1) {
      event.preventDefault();
      onKeyboardMove(index, 1);
    }
  };

  const handle = (
    <button
      ref={registerHandle}
      type="button"
      disabled={disabled}
      aria-label={`Reorder ${label}, position ${index + 1} of ${count}. Use the arrow keys to move.`}
      title="Drag to reorder"
      onPointerDown={(event) => {
        if (disabled) return;
        event.preventDefault();
        controls.start(event);
      }}
      onKeyDown={onKeyDown}
      className="flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-sys-tertiary transition-colors hover:text-sys-secondary active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
    >
      <GripVertical className="h-4 w-4" aria-hidden="true" />
    </button>
  );

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className={cn('relative bg-sys-surface', className)}
      whileDrag={{
        scale: 1.015,
        zIndex: 10,
        boxShadow: '0 18px 40px -12px rgba(0,0,0,0.35)',
        borderRadius: 14,
      }}
      transition={{ type: 'spring', stiffness: 520, damping: 42 }}
    >
      {children(handle)}
    </Reorder.Item>
  );
}

export interface SortableListProps<T> {
  items: T[];
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  /** Called continuously while dragging and after each keyboard move. */
  onChange: (items: T[]) => void;
  /** Called once the user settles on an order (drop, or keyboard move). */
  onCommit?: (items: T[]) => void;
  /** Receives the item and its drag handle; place the handle where it fits. */
  renderItem: (item: T, handle: ReactNode, index: number) => ReactNode;
  disabled?: boolean;
  className?: string;
  itemClassName?: string;
}

/**
 * Drag-to-reorder list (pointer and touch) with a fully keyboard-operable
 * handle and screen-reader announcements.
 */
export function SortableList<T>({
  items,
  getKey,
  getLabel,
  onChange,
  onCommit,
  renderItem,
  disabled,
  className,
  itemClassName,
}: SortableListProps<T>) {
  const latest = useRef(items);
  latest.current = items;
  const handles = useRef(new Map<string, HTMLButtonElement>());
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // DOM moves can drop focus; put it back on the handle that was moved.
  useEffect(() => {
    if (!focusKey) return;
    handles.current.get(focusKey)?.focus();
    setFocusKey(null);
  }, [focusKey, items]);

  const onKeyboardMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    const moved = latest.current[index];
    if (moved === undefined) return;
    const next = moveItem(latest.current, index, target);
    onChange(next);
    onCommit?.(next);
    setFocusKey(getKey(moved));
    setAnnouncement(`${getLabel(moved)} moved to position ${target + 1} of ${next.length}.`);
  };

  return (
    <>
      <Reorder.Group
        as="ul"
        axis="y"
        values={items}
        onReorder={onChange}
        className={cn('relative', className)}
      >
        {items.map((item, index) => {
          const key = getKey(item);
          return (
            <SortableItem
              key={key}
              item={item}
              index={index}
              count={items.length}
              label={getLabel(item)}
              disabled={disabled}
              className={itemClassName}
              registerHandle={(node) => {
                if (node) handles.current.set(key, node);
                else handles.current.delete(key);
              }}
              onKeyboardMove={onKeyboardMove}
              onDragEnd={() => onCommit?.(latest.current)}
            >
              {(handle) => renderItem(item, handle, index)}
            </SortableItem>
          );
        })}
      </Reorder.Group>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </>
  );
}
