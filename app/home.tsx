import { View, Text, FlatList, Image, SafeAreaView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import TicketListLayout from '@/components/tickets/TicketListLayout';
import AntDesignIcon from '@expo/vector-icons/AntDesign';
import { Link } from 'expo-router';
const HomeScreen = () => {

    const tabs = ["Assigned", "Completed", "Not Closed"];
    const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
    
    return (
        <SafeAreaView className=''>
            <View className='  h-full'>
                <View className='px-4'>
                    <View className=''>
                        <View className='flex-row justify-between items-center'>
                            {/* <View className='flex-row items-end'>
                                <Image
                                    source={require('../assets/images/godesk.jpg')}
                                    style={{
                                        width: 30,
                                        height: 30,
                                    }}
                                />
                                <Text className='font-bold text-secondary-950 ms-.5 mb-1.5'>
                                    desk <Text className='text-primary-950'>Engineer</Text>
                                </Text>
                            </View> */}
                            <View className='ms-2'>
                                <View>
                                    <Text className='text-sm mt-10'>Good morning👋</Text>
                                    <Text className='text-md font-semibold mt-4'>Sam Joe</Text>
                                    {/* <Text><Link href={'/map/location'}> location</Link></Text>
                                    <Text><Link href={'/dropdown'}> dropdown</Link></Text> */}
                                </View>
                            </View>
                            {/* <View>
                                <AntDesignIcon name='search1' size={20} />
                            </View> */}
                        </View>
                        {/* <Text className='font-bold text-secondary-950'>Employee</Text> */}
                    </View>
                    <FlatList
                        horizontal={true}
                        data={tabs}
                        renderItem={(item) => (
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedTabIndex(item.index);
                                }}
                            >
                               
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item}
                        extraData={selectedTabIndex}
                        className='mt-4 py-4'
                    />
                </View>
                <View className='h-full'>
                    <TicketListLayout />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default HomeScreen