import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, Pressable } from 'react-native';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { DropdownProps } from '../models/common';
import PrimaryText from "@/components/PrimaryText";
const CustomDropdown: React.FC<DropdownProps> = ({
  options,
  placeholder,
  onSelect = () => { },
}) => {
  const [visible, setVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');

  const handleSelect = (item: string | { label: string; value: string }) => {
    const value = typeof item === 'string' ? item : item.value;
    setSelectedValue(value);
    setInputText(typeof item === 'string' ? item : item.label);
    onSelect(value);
    setVisible(false);
  };

  return (
    <View>
      {/* Input Text Box with Dropdown Icon */}
      <Pressable
        onPress={() => setVisible(true)}
      >
        <View
         className="flex-row items-center justify-between px-3 border
         border-gray-300 rounded-md bg-white w-full py-2.5"
        >
          <Text className={`${inputText && inputText.length > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
            {inputText && inputText.length > 0 ? inputText : placeholder}
          </Text>
          <SimpleLineIcons name="arrow-down" size={14} color="#a9a9a9" />
        </View>
      </Pressable>
      {/* Dropdown Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View className="w-96 max-h-72 bg-white rounded-lg p-4 shadow-lg">
            <FlatList
              data={options}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => {
                const displayText = typeof item === 'string' ? item : item.label;
                return (
                  <TouchableOpacity
                    className="py-3 border-b border-gray-200"
                    onPress={() => handleSelect(item)}
                  >
                    <PrimaryText className="text-base text-gray-800 font-regular">{displayText}</PrimaryText>
                  </TouchableOpacity>
                );
              }}
            />

          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CustomDropdown;
