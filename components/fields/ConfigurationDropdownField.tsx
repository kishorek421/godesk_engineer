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
import { useEffect, useState } from "react";
import { GET_CONFIGURATIONS_BY_CATEGORY } from "@/constants/api_endpoints";
import React from "react";
import apiClient from "@/clients/apiClient";

interface ConfigurationDropdownFieldProps {
  configurationCategory: string;
  selectedConfig: ConfigurationModel;
  setSelectedConfig: any;
  placeholder: string;
  onItemSelect: (config: ConfigurationModel) => void;
  defaultKey?: string;
  isDisabled?: boolean;
  defaultValue?: ConfigurationModel;
}

const ConfigurationDropdownField = ({
  configurationCategory,
  selectedConfig,
  setSelectedConfig,
  placeholder,
  onItemSelect,
  defaultKey,
  isDisabled = false,
  defaultValue,
}: ConfigurationDropdownFieldProps) => {
  const [options, setOptions] = useState<ConfigurationModel[]>([]);

  useEffect(() => {
    const fetchOptions = () => {
      apiClient
        .get(GET_CONFIGURATIONS_BY_CATEGORY, {
          params: {
            category: configurationCategory,
          },
        })
        .then((response) => {
          const configs = response.data?.data ?? [];
          if (configs) {
            console.log("configs ~~~~~~~~~~~~~~~~~~~~~~`", configs);
            setOptions(configs);
            if (defaultKey) {
              const defaultKeyDetails = configs.find(
                (config: any) => config.key === defaultKey
              );
              if (defaultKeyDetails) {
                setSelectedConfig(defaultKeyDetails);
                onItemSelect(defaultKeyDetails);
              }
            }
          }
        })
        .catch((e) => {
          console.error(e);
          setOptions([]);
        });
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    console.log("defaultValue", defaultValue);
    
    if (defaultValue?.id === undefined && defaultKey) {
      const defaultKeyDetails = options.find(
        (config: any) => config.key === defaultKey
      );
      if (defaultKeyDetails) {
        setSelectedConfig(defaultKeyDetails);
        onItemSelect(defaultKeyDetails);
      }
    }
  }, [defaultValue]);

  return (
    <Select
      className="w-full"
      selectedValue={selectedConfig.id}
      onValueChange={(e) => {
        let config = options.find((option) => e === option.id);
        if (config) {
          setSelectedConfig(config);
          onItemSelect(config);
        }
      }}
    >
      <SelectTrigger
        variant="outline"
        size="md"
        className="flex justify-between h-14"
      >
        <SelectInput
          placeholder={placeholder}
          value={selectedConfig.value}
          className={`${isDisabled ? "text-gray-500" : "text-gray-900"}`}
        />
        <SelectIcon
          className={`mr-3 ${isDisabled ? "text-gray-300" : "text-gray-500"}`}
          as={ChevronDownIcon}
        />
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

export default ConfigurationDropdownField;
