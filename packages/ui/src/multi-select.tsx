import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';

import { cn } from './utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select...',
  className,
  id,
}: MultiSelectProps) {
  const selectedLabels = value
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter(Boolean)
    .join(', ');

  const toggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onValueChange(value.filter((v) => v !== optionValue));
    } else {
      onValueChange([...value, optionValue]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          id={id}
          type='button'
          role='combobox'
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        >
          <span className='line-clamp-1 text-left'>
            {selectedLabels || (
              <span className='text-muted-foreground'>{placeholder}</span>
            )}
          </span>
          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-[var(--radix-popover-trigger-width)] p-1' align='start'>
        {options.map((option) => {
          const selected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type='button'
              data-testid={`multiselect-option-${option.value}`}
              className={cn(
                'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                selected && 'font-medium',
              )}
              onClick={() => toggle(option.value)}
            >
              <span className='absolute left-2 flex h-3.5 w-3.5 items-center justify-center'>
                {selected && <Check className='h-4 w-4' />}
              </span>
              {option.label}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

export { MultiSelect };
