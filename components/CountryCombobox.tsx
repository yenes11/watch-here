'use client';

import * as React from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useScrollActiveOption } from '@/hooks/useScrollActiveOption';
import { pluralize } from '@/lib/media';
import { normalizeForSearch } from '@/lib/text';
import { cn } from '@/lib/utils';

export interface CountryOption {
  code: string;
  name: string;
  /** Number of platforms in this country; 0 = not available there. */
  count: number;
}

interface CountryComboboxProps {
  options: CountryOption[];
  value: string | null;
  onChange: (code: string) => void;
  className?: string;
}

/** Names starting with the query (or an exact code) rank above mere matches. */
function filterOptions(options: CountryOption[], query: string): CountryOption[] {
  const needle = normalizeForSearch(query.trim());
  if (!needle) return options;

  const prefixMatches: CountryOption[] = [];
  const otherMatches: CountryOption[] = [];
  for (const option of options) {
    const name = normalizeForSearch(option.name);
    if (name.startsWith(needle) || option.code.toLowerCase() === needle) {
      prefixMatches.push(option);
    } else if (name.includes(needle)) {
      otherMatches.push(option);
    }
  }
  return [...prefixMatches, ...otherMatches];
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function CountryCombobox({
  options,
  value,
  onChange,
  className,
}: CountryComboboxProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const listId = React.useId();

  const selected = options.find((option) => option.code === value);
  const filtered = React.useMemo(() => filterOptions(options, query), [options, query]);
  const lastIndex = filtered.length - 1;
  const optionId = (code: string) => `${listId}-${code}`;

  const close = React.useCallback(({ restoreFocus = true } = {}) => {
    setIsOpen(false);
    setQuery('');
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const open = () => {
    const selectedIndex = options.findIndex((option) => option.code === value);
    setActiveIndex(Math.max(selectedIndex, 0));
    setIsOpen(true);
  };

  const pick = (code: string) => {
    onChange(code);
    close();
  };

  // Focus the search field on open; close on any press outside.
  React.useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close({ restoreFocus: false });
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen, close]);

  useScrollActiveOption(listRef, activeIndex, isOpen);

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const moveTo = (index: number) => {
      event.preventDefault();
      setActiveIndex(clamp(index, 0, lastIndex));
    };

    switch (event.key) {
      case 'ArrowDown':
        return moveTo(activeIndex + 1);
      case 'ArrowUp':
        return moveTo(activeIndex - 1);
      case 'Home':
        return moveTo(0);
      case 'End':
        return moveTo(lastIndex);
      case 'Enter': {
        event.preventDefault();
        const option = filtered[activeIndex];
        if (option) pick(option.code);
        return;
      }
      case 'Escape':
        event.preventDefault();
        return close();
      case 'Tab':
        return close({ restoreFocus: false });
    }
  };

  const onTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      open();
    }
  };

  const activeOption = filtered[activeIndex];

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={selected ? `Change country: ${selected.name}` : 'Change country'}
        onClick={() => (isOpen ? close({ restoreFocus: false }) : open())}
        onKeyDown={onTriggerKeyDown}
        className="flex w-full items-center gap-2.5 h-10 pl-3 pr-2.5 rounded-md border border-zinc-700 bg-zinc-900 text-sm text-white hover:border-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
      >
        {value && <span className="font-mono text-xs text-zinc-400">{value}</span>}
        <span className="flex-1 truncate text-left">
          {selected?.name ?? 'Choose a country'}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            'size-4 text-zinc-400 transition-transform duration-150',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-30 left-0 right-0 sm:left-auto sm:w-80 top-full mt-2 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl shadow-black/60 overflow-hidden">
          <div className="flex items-center gap-2 px-3 border-b border-zinc-800">
            <Search aria-hidden className="size-4 text-zinc-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeOption ? optionId(activeOption.code) : undefined}
              aria-label="Search countries"
              placeholder="Search countries…"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onInputKeyDown}
              className="flex-1 min-w-0 h-11 bg-transparent text-base sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none"
            />
          </div>
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label="Countries"
            className="max-h-72 overflow-y-auto overscroll-contain p-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-zinc-500">
                No match for “{query}”
              </li>
            ) : (
              filtered.map((option, index) => (
                <li
                  key={option.code}
                  id={optionId(option.code)}
                  data-index={index}
                  role="option"
                  aria-selected={option.code === value}
                  onPointerMove={() => setActiveIndex(index)}
                  onClick={() => pick(option.code)}
                  className={cn(
                    'flex items-center gap-3 h-10 px-2.5 rounded-md text-sm cursor-pointer',
                    index === activeIndex ? 'bg-zinc-800 text-white' : 'text-zinc-300'
                  )}
                >
                  <span className="w-6 font-mono text-xs text-zinc-500">{option.code}</span>
                  <span className="flex-1 truncate">{option.name}</span>
                  <span className="text-xs tabular-nums text-zinc-500">
                    {option.count > 0 ? pluralize(option.count, 'platform') : 'none'}
                  </span>
                  <Check
                    aria-hidden
                    className={cn(
                      'size-4 shrink-0',
                      option.code === value ? 'text-white' : 'invisible'
                    )}
                  />
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
