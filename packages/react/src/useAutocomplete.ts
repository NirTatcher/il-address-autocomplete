import {
  useCallback,
  useEffect,
  useId,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

export interface UseAutocompleteOptions<T> {
  items: T[];
  selectedItem: T | null;
  onSelect: (item: T) => void;
  getItemLabel: (item: T) => string;
  disabled?: boolean;
}

export interface UseAutocompleteResult<T> {
  inputValue: string;
  setInputValue: (value: string) => void;
  items: T[];
  highlightedIndex: number;
  isOpen: boolean;
  selectedItem: T | null;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  getItemProps: (index: number) => {
    id: string;
    role: "option";
    "aria-selected": boolean;
    onMouseDown: (event: MouseEvent) => void;
    onMouseEnter: () => void;
  };
  listboxProps: {
    id: string;
    role: "listbox";
  };
  clear: () => void;
}

export function useAutocomplete<T>({
  items,
  selectedItem,
  onSelect,
  getItemLabel,
  disabled = false,
}: UseAutocompleteOptions<T>): UseAutocompleteResult<T> {
  const listId = useId();
  const [inputValue, setInputValueState] = useState(() =>
    selectedItem ? getItemLabel(selectedItem) : "",
  );
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setInputValueState(getItemLabel(selectedItem));
    }
  }, [selectedItem, getItemLabel]);

  const setInputValue = useCallback((value: string) => {
    setInputValueState(value);
    setHighlightedIndex(-1);
    setIsOpen(true);
  }, []);

  const selectItem = useCallback(
    (item: T) => {
      onSelect(item);
      setInputValueState(getItemLabel(item));
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [getItemLabel, onSelect],
  );

  const clear = useCallback(() => {
    setInputValueState("");
    setHighlightedIndex(-1);
    setIsOpen(false);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      if (!isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        setIsOpen(true);
        return;
      }

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setHighlightedIndex((current) =>
            current < items.length - 1 ? current + 1 : 0,
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setHighlightedIndex((current) =>
            current > 0 ? current - 1 : items.length - 1,
          );
          break;
        case "Enter":
          if (highlightedIndex >= 0 && items[highlightedIndex]) {
            event.preventDefault();
            selectItem(items[highlightedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
        default:
          break;
      }
    },
    [disabled, highlightedIndex, isOpen, items, selectItem],
  );

  const inputProps: InputHTMLAttributes<HTMLInputElement> = {
    value: inputValue,
    role: "combobox",
    "aria-expanded": isOpen,
    "aria-controls": listId,
    "aria-autocomplete": "list",
    "aria-activedescendant":
      highlightedIndex >= 0 ? `${listId}-item-${highlightedIndex}` : undefined,
    disabled,
    onChange: (event: ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value),
    onFocus: () => !disabled && setIsOpen(true),
    onBlur: () => setIsOpen(false),
    onKeyDown: handleKeyDown,
  };

  const getItemProps = useCallback(
    (index: number) => ({
      id: `${listId}-item-${index}`,
      role: "option" as const,
      "aria-selected": highlightedIndex === index,
      onMouseDown: (event: MouseEvent) => {
        event.preventDefault();
        if (items[index]) selectItem(items[index]);
      },
      onMouseEnter: () => setHighlightedIndex(index),
    }),
    [highlightedIndex, items, listId, selectItem],
  );

  return {
    inputValue,
    setInputValue,
    items,
    highlightedIndex,
    isOpen,
    selectedItem,
    inputProps,
    getItemProps,
    listboxProps: {
      id: listId,
      role: "listbox",
    },
    clear,
  };
}
