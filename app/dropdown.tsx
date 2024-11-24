import React from 'react';
import { View } from 'react-native';
import CustomDropdown from '../components/DropDown';

const App = () => {
  const handleSelectOption = (option: string) => {
    console.log('Selected option:', option);
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100">
      <CustomDropdown
        options={['Apple', 'Banana', 'Cherry', 'Date', 'Grape']}
        placeholder=""
        onSelect={handleSelectOption}
      />
    </View>
  );
};

export default App;
