import * as React from 'react'
import { Check, ChevronDown, X, Search } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './button'
import { Input } from './input'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Badge } from './badge'
import { ScrollArea } from './scroll-area'
import { Separator } from './separator'

export interface AutocompleteOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
  group?: string
}

export interface AutocompleteProps {
  options: AutocompleteOption[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  multiple?: boolean
  disabled?: boolean
  clearable?: boolean
  searchable?: boolean
  className?: string
  maxSelected?: number
  createable?: boolean
  onCreateOption?: (inputValue: string) => void
}

const Autocomplete = React.forwardRef<HTMLDivElement, AutocompleteProps>(
  (
    {
      options = [],
      value,
      onValueChange,
      placeholder = 'Select option...',
      searchPlaceholder = 'Search...',
      emptyMessage = 'No results found.',
      multiple = false,
      disabled = false,
      clearable = true,
      searchable = true,
      className,
      maxSelected,
      createable = false,
      onCreateOption,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState('')
    const inputRef = React.useRef<HTMLInputElement>(null)

    // Normalize value to array for easier handling
    const selectedValues = React.useMemo(() => {
      if (!value) return []
      return Array.isArray(value) ? value : [value]
    }, [value])

    // Filter options based on search
    const filteredOptions = React.useMemo(() => {
      if (!search) return options
      return options.filter(
        (option) =>
          option.label.toLowerCase().includes(search.toLowerCase()) ||
          option.value.toLowerCase().includes(search.toLowerCase()) ||
          (option.description && option.description.toLowerCase().includes(search.toLowerCase()))
      )
    }, [options, search])

    // Group options
    const groupedOptions = React.useMemo(() => {
      const groups: Record<string, AutocompleteOption[]> = {}
      const ungrouped: AutocompleteOption[] = []

      filteredOptions.forEach((option) => {
        if (option.group) {
          if (!groups[option.group]) {
            groups[option.group] = []
          }
          groups[option.group].push(option)
        } else {
          ungrouped.push(option)
        }
      })

      return { groups, ungrouped }
    }, [filteredOptions])

    // Get display text
    const getDisplayText = () => {
      if (selectedValues.length === 0) return placeholder

      if (!multiple) {
        const option = options.find((opt) => opt.value === selectedValues[0])
        return option?.label || selectedValues[0]
      }

      if (selectedValues.length === 1) {
        const option = options.find((opt) => opt.value === selectedValues[0])
        return option?.label || selectedValues[0]
      }

      return `${selectedValues.length} items selected`
    }

    // Handle selection
    const handleSelect = (optionValue: string) => {
      if (multiple) {
        const newValue = selectedValues.includes(optionValue)
          ? selectedValues.filter((v) => v !== optionValue)
          : [...selectedValues, optionValue]

        if (maxSelected && newValue.length > maxSelected) return

        onValueChange?.(newValue)
      } else {
        onValueChange?.(optionValue)
        setOpen(false)
      }
    }

    // Handle clear
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      onValueChange?.(multiple ? [] : '')
    }

    // Handle remove single item in multiple mode
    const handleRemove = (valueToRemove: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (multiple) {
        const newValue = selectedValues.filter((v) => v !== valueToRemove)
        onValueChange?.(newValue)
      }
    }

    // Handle create new option
    const handleCreate = () => {
      if (createable && onCreateOption && search.trim()) {
        onCreateOption(search.trim())
        setSearch('')
      }
    }

    const canCreate = createable && search.trim() && 
      !filteredOptions.some(opt => opt.value.toLowerCase() === search.toLowerCase().trim())

    return (
      <div ref={ref} className={cn('relative', className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={disabled}
            >
              <div className="flex flex-1 items-center gap-2">
                {multiple && selectedValues.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedValues.slice(0, 2).map((val) => {
                      const option = options.find((opt) => opt.value === val)
                      return (
                        <Badge key={val} variant="secondary" className="text-xs">
                          {option?.label || val}
                          <button
                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleRemove(val, e as any)
                              }
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                            onClick={(e) => handleRemove(val, e)}
                          >
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                          </button>
                        </Badge>
                      )
                    })}
                    {selectedValues.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{selectedValues.length - 2} more
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className={cn(
                    selectedValues.length === 0 && 'text-muted-foreground'
                  )}>
                    {getDisplayText()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {clearable && selectedValues.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="rounded-sm opacity-50 hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <div className="flex flex-col">
              {searchable && (
                <div className="flex items-center border-b px-3">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input
                    ref={inputRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && canCreate) {
                        handleCreate()
                      }
                    }}
                  />
                </div>
              )}
              
              <ScrollArea className="max-h-[300px]">
                {filteredOptions.length === 0 && !canCreate ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </div>
                ) : (
                  <div className="p-1">
                    {canCreate && (
                      <>
                        <button
                          onClick={handleCreate}
                          className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                          Create "{search.trim()}"
                        </button>
                        {filteredOptions.length > 0 && <Separator className="my-1" />}
                      </>
                    )}
                    
                    {/* Ungrouped options */}
                    {groupedOptions.ungrouped.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        disabled={option.disabled}
                        className={cn(
                          'w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed',
                          selectedValues.includes(option.value) && 'bg-accent'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{option.label}</div>
                            {option.description && (
                              <div className="text-xs text-muted-foreground">
                                {option.description}
                              </div>
                            )}
                          </div>
                          {selectedValues.includes(option.value) && (
                            <Check className="h-4 w-4" />
                          )}
                        </div>
                      </button>
                    ))}

                    {/* Grouped options */}
                    {Object.entries(groupedOptions.groups).map(([group, groupOptions]) => (
                      <div key={group}>
                        {(groupedOptions.ungrouped.length > 0 || Object.keys(groupedOptions.groups).indexOf(group) > 0) && (
                          <Separator className="my-1" />
                        )}
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {group}
                        </div>
                        {groupOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            disabled={option.disabled}
                            className={cn(
                              'w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed',
                              selectedValues.includes(option.value) && 'bg-accent'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{option.label}</div>
                                {option.description && (
                                  <div className="text-xs text-muted-foreground">
                                    {option.description}
                                  </div>
                                )}
                              </div>
                              {selectedValues.includes(option.value) && (
                                <Check className="h-4 w-4" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)

Autocomplete.displayName = 'Autocomplete'

export { Autocomplete }