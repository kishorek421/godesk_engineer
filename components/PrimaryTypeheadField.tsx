import {
  Text,
  Dimensions,
  Platform,
  View,
  KeyboardTypeOptions,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import {
  AutocompleteDropdown,
  AutocompleteDropdownItem,
  IAutocompleteDropdownRef,
} from "react-native-autocomplete-dropdown";
import Feather from 'react-native-vector-icons/Feather';
import { DropdownItemModel } from "@/models/ui/dropdown_item_model";
import { isFormFieldInValid } from "@/utils/helper";
import { ErrorModel } from "@/models/common";

interface PrimaryTypeheadFieldProps {
  type: any;
  onClearPress: (type: any) => void;
  selectedValue?: AutocompleteDropdownItem; 
  // suggestions: DropdownItemModel[];
  suggestions: any[];
  getSuggestions: (q: string, type: any, setLoading: any) => void;
  setSelectedValue: any;
  placeholder: string;
  filterExp?: RegExp;
  editable?: boolean;
  onItemSelect?: (type: any, item: DropdownItemModel) => void;
  keyboardType?: KeyboardTypeOptions;
  errors: ErrorModel[];
  fieldName: string;
  backgroundColor?: string;
}

const PrimaryTypeheadField = ({
  type,
  onClearPress,
  selectedValue,
  suggestions,
  getSuggestions,
  setSelectedValue,
  placeholder,
  filterExp,
  editable = true,
  onItemSelect,
  keyboardType = "default",
  errors,
  fieldName,
  backgroundColor = "#f2f2f2",
}: PrimaryTypeheadFieldProps) => {
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const dropdownController = useRef<IAutocompleteDropdownRef | null>(null);

  useEffect(() => {
    if (selectedValue?.id) {
      dropdownController.current?.setItem(selectedValue);
    }
  }, [selectedValue]);

  return (
    <AutocompleteDropdown
      // ref={searchRef}
      controller={(controller: IAutocompleteDropdownRef | null) => {
        dropdownController.current = controller;
      }}
      initialValue={{ id: selectedValue?.id ?? "" }}
      // direction={Platform.select({ ios: "down" })}
      dataSet={suggestions}
      onChangeText={(text: string) => {
        console.log("txext", text);
        if (filterExp && !filterExp.test(text)) {
          return;
        }
        setSearchText(text);
        getSuggestions(text, type, setLoading);
      }}
      onSelectItem={(item: any) => {
        if (item) {
          setSelectedValue(item);
          if (onItemSelect) {
            onItemSelect(type, item);
          }
        }
      }}
      // debounce={600}
      // suggestionsListMaxHeight={Dimensions.get("window").height * 0.4}
      onClear={() => {
        onClearPress(type);
      }}
      //  onSubmit={(e) => onSubmitSearch(e.nativeEvent.text)}
      //   onOpenSuggestionsList={onOpenSuggestionsList}
      loading={loading}
      useFilter={false} // set false to prevent rerender twice
      textInputProps={{
        placeholder: placeholder,
        autoCorrect: false,
        autoCapitalize: "none",
        // value: searchText,
        keyboardType: keyboardType,
        style: {
          // borderRadius: 5,
          borderTopLeftRadius: 5,
          borderBottomLeftRadius: 5,
          backgroundColor: backgroundColor,
          // borderColor: "#8c8c8c",
          color: "#000000",
          paddingLeft: 12,
          fontSize: 14,
        },
      }}
      rightButtonsContainerStyle={{
        right: 0,
        paddingRight: 5,
        backgroundColor: backgroundColor,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        alignSelf: "center",
      }}
      inputContainerStyle={{
        backgroundColor:
          isFormFieldInValid(fieldName, errors).length === 0
            ? "#d8d7d7"
            : "#b91c1c",
        borderRadius: 5,
        // borderColor: "#8c8c8c",
        padding: 1,
      }}
      suggestionsListContainerStyle={{
        backgroundColor: "#fff",
      }}
      containerStyle={{
        flexGrow: 1,
        flexShrink: 1,
      }}
      renderItem={(item , text ) => (
        <Text style={{ color: "#000", padding: 15 }}>{item.title}</Text>
      )}
      ChevronIconComponent={
        <Feather name="chevron-down" size={20} color="#8c8c8c" />
      }
      //   ClearIconComponent={<Feather name="x-circle" size={18} color="#fff" />}
      inputHeight={35}
      showChevron={editable}
      closeOnBlur={false}
      showClear={editable}
      clearOnFocus={false}
      EmptyResultComponent={
        searchText.length === 0 ? (
          <View></View>
        ) : (
          <View className="py-3 px-3">
            <Text>No items found</Text>
          </View>
        )
      }
      editable={editable}
    />
  );
};

export default PrimaryTypeheadField;
