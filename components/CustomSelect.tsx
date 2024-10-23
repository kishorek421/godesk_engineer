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

interface PrimarySelectProps {
  options: any[];
  selectedValue: any;
  type: string;
  onChange: (type: string, selectedConfig: any) => void;
  placeholder: string;
}

const CustomSelect = ({
  options,
  selectedValue,
  type,
  onChange,
  placeholder,
}: PrimarySelectProps) => {
  useEffect(() => {
    console.log(selectedValue);
  }, [selectedValue]);
  return (
    <Select
      className="w-full"
      selectedValue={selectedValue?.value}
      onValueChange={(e) => {
        // let config = options.find((option) => e === option.id);
        // if (config) {
        //   setSelectedConfig(config);
        // }
        onChange(type, e);
      }}
    >
      <SelectTrigger variant="outline" size="md">
        <SelectInput
          className="w-96"
          placeholder={placeholder}
          value={selectedValue?.label}
        />
        <SelectIcon className="mr-3 " as={ChevronDownIcon} />
      </SelectTrigger>
      <SelectPortal>
        <SelectBackdrop />
        <SelectContent>
          <SelectDragIndicatorWrapper>
            <SelectDragIndicator />
          </SelectDragIndicatorWrapper>
          {options.map((value) => (
            <SelectItem
              label={value?.label ?? "-"}
              value={value?.value ?? ""}
              key={value?.value}
            />
          ))}
        </SelectContent>
      </SelectPortal>
    </Select>
  );
};

export default CustomSelect;
