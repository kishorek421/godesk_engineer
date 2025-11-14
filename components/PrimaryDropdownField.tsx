import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
  KeyboardAvoidingView,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import PrimaryText from "../components/PrimaryText";
import Octicons from "@expo/vector-icons/Octicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Ionicons } from "@expo/vector-icons";

interface PrimaryDropdownFieldProps {
  options: any[];
  selectedValue: any;
  type: string;
  onItemSelect: (type: string, selectedConfig: any) => void;
  placeholder: string;
  setSelectedValue: any;
  parentRef: React.RefObject<any>;
  onEndReached?: () => void;
  contentClassName?: string;
  onClear?: () => void;
  offlineSearch?: boolean;
  emptyMsg?: string;
  disabled?: boolean;
}

const PrimaryDropdownField = ({
  options,
  selectedValue,
  type,
  onItemSelect,
  placeholder,
  parentRef,
  setSelectedValue,
  onEndReached,
  contentClassName,
  onClear,
  offlineSearch = true,
  emptyMsg,
  disabled = false,
}: PrimaryDropdownFieldProps) => {
  const [dropdownOptions, setDropdownOptions] = useState<any[]>([]);

  const screenHeight = Dimensions.get("window").height;

  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [dropdownPos, setDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 0,
  });
  const buttonRef = useRef(null);

  useEffect(() => {
    console.log(
      "options changed ~~~~~~~~~~~~~~~~~~~~~~~~~~~>>>>>>",
      "type ----------->",
      type
    );
    setDropdownOptions(options);
  }, [options]);

  const handleClear = () => {
    setSelectedValue(undefined);
    onClear && onClear();
  };
  const handleClearSearch = () => {
    setSearchText("");
    setDropdownOptions(options); // Reset to full list
  };
  const openDropdown = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      const spaceBelow = screenHeight - (y + height);
      const maxHeight = spaceBelow - 20; // Leave 20px margin from bottom

      setDropdownPos({
        top: y + height,
        left: x,
        width,
        maxHeight,
      });
      setVisible(true);
    });
  };

  return (
    // <Select
    //   className="w-full"
    //   selectedValue={selectedValue?.value}
    //   onValueChange={(e: any) => {
    //     // setSelectedValue(e);
    //     onItemSelect(type, e);
    //   }}
    // >
    //   <SelectTrigger variant="outline" className="flex justify-between h-14">
    //     <SelectInput
    //       placeholder={t(placeholder)}
    //       value={selectedValue?.label}
    //     />
    //     {selectedValue?.value ? (
    //       <Pressable onPress={handleClear} className="mr-3">
    //         <AntDesign name="closecircle" size={20} color="#9ca3af" />
    //       </Pressable>
    //     ) : (
    //       <SelectIcon className="mr-3" as={ChevronDownIcon} />
    //     )}
    //   </SelectTrigger>
    //   <SelectPortal>
    //     <SelectBackdrop />
    //     <SelectContent className={contentClassName}>
    //       <SelectDragIndicatorWrapper>
    //         <SelectDragIndicator />
    //       </SelectDragIndicatorWrapper>
    //       <SelectFlatList
    //         renderItem={({ item }) => {
    //           if (!item) return <View></View>;
    //           const dropdownItem: DropdownModel = { ...item };
    //           return (
    //             <SelectItem
    //               label={dropdownItem.label ?? "-"}
    //               value={dropdownItem.value ?? ""}
    //               key={dropdownItem.value}
    //             />
    //           );
    //         }}
    //         data={options}
    //         onEndReached={onEndReached}
    //       />
    //       {/* {options &&
    //         options.map((value) => (
    //           <SelectItem
    //             label={value.label ?? "-"}
    //             value={value.value ?? ""}
    //             key={value.value}
    //           />
    //         ))} */}
    //     </SelectContent>
    //   </SelectPortal>
    // </Select>

    <View>
      <Pressable ref={buttonRef} onPress={openDropdown} disabled={disabled}>
        <View
          className={`border-[1px] ${disabled ? "border-gray-200 bg-gray-100" : "border-gray-300"} rounded-md h-14 flex-col justify-center items-start px-3`}
        >
          <PrimaryText
            className={`
    ${disabled ? "text-gray-400" : selectedValue?.label ? "text-gray-900" : "text-gray-500"}
  `}
          >
            {selectedValue?.label ?? placeholder}
          </PrimaryText>
        </View>
      </Pressable>
      <View className=" absolute right-0 bottom-0 top-0 rounded-md flex-row items-center justify-center px-3">
        <View className="flex-row justify-center items-center gap-2">
          {selectedValue?.label && !disabled && (
            <Pressable onPress={handleClear}>
              <Ionicons name="close-circle" size={14} color="grey" />
            </Pressable>
          )}
          <Pressable onPress={openDropdown} disabled={disabled}>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={24}
              color="#9ca3af"
            />
          </Pressable>
        </View>
      </View>
      <Modal transparent visible={visible} animationType="none">
        <Pressable
          className="absolute top-0 left-0 right-0 bottom-0"
          onPress={() => setVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
          >
            <View
              style={{
                position: "absolute",
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
                maxHeight: dropdownPos.maxHeight,
              }}
              className={`bg-white rounded-lg ${Platform.OS === "ios" ? "shadow-md" : "shadow-xl"}`}
            >
              {options.length > 5 && (
                <View className="px-2 pt-3 mb-2">
                  <View>
                    <TextInput
                      placeholder="Search here"
                      placeholderTextColor="gray"
                      className="p-4 border-[1px] border-gray-400  rounded-lg"
                      value={searchText}
                      onChangeText={(text) => {
                        setSearchText(text);
                        if (offlineSearch) {
                          const filteredOptions = options.filter((option) =>
                            option.label
                              .toLowerCase()
                              .includes(text.toLowerCase())
                          );
                          setDropdownOptions(filteredOptions);
                        }
                      }}
                    />
                    <Pressable
                      className="absolute top-0 bottom-0 right-4 mx-3 p-4 mt-1 rounded-lg"
                      onPress={handleClearSearch}
                    >
                      <Ionicons name="close-circle" size={14} color="grey" />
                    </Pressable>
                    <Pressable className="absolute top-0 bottom-0 right-0 p-4 rounded-lg">
                      <View className="">
                        <Octicons name="search" size={20} color="gray" />
                      </View>
                    </Pressable>
                  </View>
                  {searchText.length > 0 && dropdownOptions.length === 0 && (
                    <PrimaryText className="text-center text-gray-500 mt-4">
                      No search result found
                    </PrimaryText>
                  )}
                </View>
              )}
              {options.length === 0 ? (
                <View className="flex-row justify-center items-center p-4">
                  <PrimaryText className="text-gray-500" translate="none">
                    {emptyMsg ? emptyMsg : "No options found"}
                  </PrimaryText>
                </View>
              ) : (
                <FlatList
                  data={dropdownOptions}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <Pressable
                      className="p-3 border-b border-gray-200"
                      onPress={() => {
                        console.log("item ------>", item);
                        onItemSelect(type, item.value);
                        setVisible(false);
                      }}
                    >
                      <PrimaryText className="text-base text-gray-800">
                        {item.label ?? "-"}
                      </PrimaryText>
                    </Pressable>
                  )}
                  onEndReached={onEndReached}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode={
                    Platform.OS === "ios" ? "on-drag" : "none"
                  }
                />
              )}
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
};

export default PrimaryDropdownField;
