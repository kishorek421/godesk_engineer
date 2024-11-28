import { View, Text, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { TicketListItemModel } from "@/models/tickets";
import api from "@/services/api/base_api_service";
import TicketStatusComponent from "@/components/tickets/TicketStatusComponent";
import moment from "moment";
import { GET_INPROGRESS_TICKETS_DETAILS, GET_USER_DETAILS } from "@/constants/api_endpoints";
import TicketListLayout from '@/components/tickets/TicketListLayout';
import {UserDetailsModel} from '@/models/users'
const HomeScreen = () => {
    const { ticketId } = useLocalSearchParams();
    const [ticketModel, setTicketModel] = useState<TicketListItemModel | null>(null);
    const [userDetails, setUserDetails] = useState<UserDetailsModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTicketDetails();
        fetchUserDetails(); 
    }, []);

    const fetchTicketDetails = () => {
        api.get(GET_INPROGRESS_TICKETS_DETAILS)
            .then((response) => {
                const ticketData = response.data?.data?.content?.[0] ?? null;
                setTicketModel(ticketData);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching tickets", error);
                setIsLoading(false);
            });
    };

    const fetchUserDetails = () => {
        api.get(GET_USER_DETAILS)
            .then((response) => {
                console.log(response.data?.data);
                
                const userData = response.data.data ?? {};
                setUserDetails(userData);
            })
            .catch((error) => {
                console.error("Error fetching user details", error);
            });
    };

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    return (
        <SafeAreaView>
            

            <FlatList
                data={ticketModel ? [ticketModel] : []} 
                keyExtractor={(item) => item.id?.toString() ?? item.ticketNo ?? "defaultKey"}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="flex-1 w-full p-4 rounded-sm mb-4"
                        onPress={() => {
                            router.push({
                                pathname: "/ticket_details/[ticketId]",
                                params: { ticketId: item.id ?? "" },
                            });
                        }}
                    >
                        <View className="flex mb-4">
                            <Text>
                                <Text className="text-2xl font-bold">
                                    Hello{" "}
                                </Text>
                                <Text className="text-md text-gray-900 font-semibold mt-[2px]">
                                    {userDetails?.firstName ?? ""} {userDetails?.lastName ?? ""} 👋
                                </Text>
                            </Text>
                        </View>
                        <View className="bg-white px-4 py-3 rounded-lg w-full">
                            <View className="flex">
                                <View className="flex-row justify-between w-full">
                                    <View>
                                        <Text className="text-gray-900 font-bold">
                                            {item.ticketNo ?? "-"}
                                        </Text>
                                        <Text className="text-gray-500 text-[13px] mt-[1px]">
                                            Issue in {item.issueTypeDetails?.name ?? "-"}
                                        </Text>
                                    </View>
                                    <TicketStatusComponent
                                        statusKey={item.statusDetails?.key ?? ""}
                                        statusValue={item.statusDetails?.value ?? ""}
                                    />
                                </View>
                                <View className="border-dashed border-[1px] border-gray-300 h-[1px] mt-3 mb-3 w-full" />
                                <View className="w-full">
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex">
                                            <Text className="text-gray-500 text-md">
                                                Raised by
                                            </Text>
                                            <Text className="text-md text-gray-900 font-semibold mt-[2px]">
                                                {item.customerDetails?.firstName ?? ""} {item.customerDetails?.lastName ?? ""}
                                            </Text>
                                        </View>
                                        <View className="flex items-end">
                                            <Text className="text-gray-500 text-md">
                                                Raised At
                                            </Text>
                                            <Text className="text-md text-gray-900 font-semibold mt-[2px]">
                                                {item.createdAt ? moment(Number.parseInt(item.createdAt)).fromNow() : "-"}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
            <TicketListLayout />
        </SafeAreaView>
    );
};

export default HomeScreen;
