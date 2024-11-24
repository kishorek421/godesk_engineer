import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { DropdownProps } from '../models/common';

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
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="flex-row items-center justify-between px-3 py-2 border border-gray-300 rounded-sm bg-white w-full"
      >
        <TextInput
          className="flex-1 text-base text-gray-800 p-0"
          placeholder={placeholder}
          value={inputText}
          editable={false}
        />
        <FontAwesome name="chevron-down" size={16} color="#a9a9a9" />
      </TouchableOpacity>

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
                    <Text className="text-base text-gray-800">{displayText}</Text>
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
