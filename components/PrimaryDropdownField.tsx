import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { ChevronDownIcon } from "@/components/ui/icon";
import { useEffect } from "react";
import * as React from 'react';

interface PrimaryDropdownFieldProps {
  options: any[];
  selectedValue: any;
  type: string;
  onSelect: (selected: string) => void;
  placeholder: string;
  setSelectedValue: any;
}
 
const PrimaryDropdownField = ({
  options,
  selectedValue,
  type,
  onSelect,
  placeholder,
  setSelectedValue,
}: PrimaryDropdownFieldProps) => {
  // useEffect(() => {}, [selectedValue]);

  return (
    <Select
      className="w-full "
      selectedValue={selectedValue.value}
      onValueChange={(e) => {
        // setSelectedValue(e);
        onSelect && onSelect(type);
      }}
    >
      <SelectTrigger variant="outline" size="md">
        <SelectInput
          className="w-96 "
          placeholder={placeholder}
          value={selectedValue.label}
        />
        <SelectIcon className="mr-3 " as={ChevronDownIcon} />
      </SelectTrigger>
      <SelectPortal>
        <SelectBackdrop />
        <SelectContent>
          <SelectDragIndicatorWrapper>
            <SelectDragIndicator />
          </SelectDragIndicatorWrapper>
          {options &&
            options.map((value) => (
              <SelectItem
                label={value.label ?? "-"}
                value={value.value ?? ""}
                key={value.value}
              />
            ))}
        </SelectContent>
      </SelectPortal>
    </Select>
  );
};

export default PrimaryDropdownField;
