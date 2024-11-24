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
import { ConfigurationModel } from "@/models/configurations";

interface PrimarySelectProps {
  options: ConfigurationModel[];
  selectedConfig: ConfigurationModel;
  setSelectedConfig: any;
  placeholder: string;
}

const ConfigurationSelect = ({
  
  options,
  selectedConfig,
  setSelectedConfig,
  placeholder,
}: PrimarySelectProps) => {
  return (
    <Select
      className="w-full"
      selectedValue={selectedConfig.id}
      onValueChange={(e) => {
        let config = options.find((option) => e === option.id);
        if (config) {
          setSelectedConfig(config);
        }
      }}
    >
      <SelectTrigger variant="outline" size="md">
        <SelectInput
          className="w-96"
          placeholder={placeholder}
          value={selectedConfig.value}
        />
        <SelectIcon className="mr-4 " as={ChevronDownIcon} />
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
                label={value.value ?? "-"}
                value={value.id ?? ""}
                key={value.id}
              />
            ))}
        </SelectContent>
      </SelectPortal>
    </Select>
  );
};

export default ConfigurationSelect;
