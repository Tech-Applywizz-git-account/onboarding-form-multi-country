
// //src/components/MultiSelect.tsx
// import React, { useState } from 'react';
// import { Check, ChevronsUpDown, X } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { Badge } from '@/components/ui/badge';

// interface Option {
//   value: string;
//   label: string;
// }

// interface MultiSelectProps {
//   options: Option[];
//   selected: string[];
//   onSelectionChange: (selected: string[]) => void;
//   placeholder?: string;
//   className?: string;
//   label?: string;
//   error?: string;
// }

// const MultiSelect: React.FC<MultiSelectProps> = ({
//   options,
//   selected,
//   onSelectionChange,
//   placeholder = "Select items...",
//   className,
//   label,
//   error
// }) => {
//   const [open, setOpen] = useState(false);
//   const [searchValue, setSearchValue] = useState('');

//   const handleSelect = (value: string) => {
//     const newSelected = selected.includes(value)
//       ? selected.filter(item => item !== value)
//       : [...selected, value];
//     onSelectionChange(newSelected);
//   };

//   const handleRemove = (value: string) => {
//     onSelectionChange(selected.filter(item => item !== value));
//   };

//   const selectedOptions = options.filter(option => selected.includes(option.value));

//   return (
//     <div className={cn('space-y-2', className)}>
//       {label && (
//         <label className="text-sm font-medium text-foreground">{label}</label>
//       )}
      
//       <Popover open={open} onOpenChange={setOpen}>
//         <PopoverTrigger asChild>
//           <Button
//             // variant="outline"
//             role="combobox"
//             aria-expanded={open}
//             className={cn(
//               'w-full justify-between min-h-[40px] h-auto input-field bg-blue-100 hover:text-white  border-gray-200',
//               error && 'border-destructive'
//             )}
//           >
//             <div className="flex flex-wrap gap-1 mr-2 ">
//               {selectedOptions.length === 0 ? (
//                 <span className="text-muted-foreground">{placeholder}</span>
//               ) : (
//                 selectedOptions.map(option => (
//                   <Badge
//                     key={option.value}
//                     variant="secondary"
//                     className="text-xs bg-primary/20 text-gray-900 "
//                   >
//                     {option.label}
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="ml-1 h-auto p-0 text-primary hover:text-gray-900"
//                       onClick={(e) => {
//                         e.preventDefault();
//                         e.stopPropagation();
//                         handleRemove(option.value);
//                       }}
//                     >
//                       <X className="h-3 w-3" />
//                     </Button>
//                   </Badge>
//                 ))
//               )}
//             </div>
//             <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent className="w-full p-0 glass-card border-card-border">
//           <Command className="bg-transparent">
//             <CommandInput 
//               placeholder="Search..." 
//               value={searchValue}
//               onValueChange={setSearchValue}
//               className="border-none bg-transparent"
//             />
//             <CommandEmpty>No results found.</CommandEmpty>
//             <CommandGroup className="max-h-64 overflow-auto">
//               {options.map(option => (
//                 <CommandItem
//                   key={option.value}
//                   value={option.value}
//                   onSelect={() => handleSelect(option.value)}
// className="cursor-pointer  text-gray-900"
//                 >
//                   <Check
//                     className={cn(
//                       'mr-2 h-4 w-4',
//                       selected.includes(option.value) ? 'opacity-100' : 'opacity-0'
//                     )}
//                   />
//                   {option.label}
//                 </CommandItem>
//               ))}
//             </CommandGroup>
//           </Command>
//         </PopoverContent>
//       </Popover>
      
//       {error && (
//         <p className="text-sm text-destructive">{error}</p>
//       )}
//     </div>
//   );
// };

// export default MultiSelect;




// src/components/MultiSelect.tsx
import React, { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  onSearchChange?: (search: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onSelectionChange,
  onSearchChange,
  placeholder = 'Select items...',
  className,
  label,
  error,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    onSearchChange?.(val);
  };

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onSelectionChange(newSelected);
  };

  const handleRemove = (value: string) => {
    onSelectionChange(selected.filter((item) => item !== value));
  };

  const selectedOptions = options.filter((option) => selected.includes(option.value));

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button" // important: prevent form submission
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-full justify-between min-h-[44px] h-auto bg-slate-50/50 hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm transition-all',
              error && 'border-destructive'
            )}
          >
            <div className="flex flex-wrap gap-1 mr-2">
              {selectedOptions.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="text-xs bg-primary/20 text-gray-900 inline-flex items-center"
                  >
                    {option.label}
                    {/* Use span (not button) to avoid button-in-button nesting */}
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Remove ${option.label}`}
                      className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded hover:bg-muted"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(option.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(option.value);
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 glass-card border-card-border" align="start">
          <Command className="bg-transparent">
            <CommandInput
              placeholder="Search..."
              value={searchValue}
              onValueChange={handleSearchChange}
              className="border-none bg-transparent"
            />
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="cursor-pointer text-gray-900"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selected.includes(option.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default MultiSelect;
