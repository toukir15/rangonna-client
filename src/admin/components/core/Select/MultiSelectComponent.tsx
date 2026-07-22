import React, { useState } from "react";
import { Multiselect } from "multiselect-react-dropdown";

interface Option {
  cat?: string;
  label: string;
  value: any;
  [label: string]: any;
}

interface MultiSelectProps {
  options: Option[];
  selectedValues?: Option[];
  displayValue?: string;
  groupBy?: string;
  showCheckbox?: boolean;
  placeholder?: string;
  singleSelect?: boolean;
  onSelect?: (selectedList: Option[], selectedItem?: Option) => void;
  onRemove?: (selectedList: Option[], removedItem?: Option) => void;
  onSearch?: (value: string) => void;
  onChange?: (selectedKeyValuePairs: Record<string, any>) => void;
  style?: React.CSSProperties;
  className?: string;
}

const MultiSelectComponent: React.FC<MultiSelectProps> = ({
  options,
  selectedValues = [],
  displayValue = "label",
  groupBy = "cat",
  showCheckbox = true,
  placeholder = "Select options",
  singleSelect = false,
  onSelect = () => {},
  onRemove = () => {},
  onSearch = () => {},
  onChange = () => {},
  style = {},
  className,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedItems, setSelectedItems] = useState<Option[]>(selectedValues);

  const handleSelect = (selectedList: Option[], selectedItem?: Option) => {
    setSelectedItems(selectedList);
    onSelect(selectedList, selectedItem);

    const keyValuePairs = selectedList.reduce((acc, item) => {
      acc[item.label] = item.value;
      return acc;
    }, {} as Record<string, any>);

    onChange(keyValuePairs);
  };

  const handleRemove = (selectedList: Option[], removedItem?: Option) => {
    setSelectedItems(selectedList);
    onRemove(selectedList, removedItem);

    const keyValuePairs = selectedList.reduce((acc, item) => {
      acc[item.label] = item.value;
      return acc;
    }, {} as Record<string, any>);

    onChange(keyValuePairs);
  };

  return (
    <Multiselect
      className={`${className && className} bg-white rounded-lg`}
      options={options}
      selectedValues={selectedValues}
      onSelect={handleSelect}
      onRemove={handleRemove}
      displayValue={displayValue}
      groupBy={groupBy}
      showCheckbox={showCheckbox}
      placeholder={placeholder}
      singleSelect={singleSelect}
      onSearch={onSearch}
      style={{
        chips: {
          background: "#4a90e2",
        },
        searchBox: {
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "6px",
          ...style,
        },
        option: {
          color: "#333",
        },
        ...style,
      }}
      avoidHighlightFirstOption
    />
  );
};

export default MultiSelectComponent;
