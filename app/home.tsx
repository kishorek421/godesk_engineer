import { View, Text, FlatList, SafeAreaView, TouchableOpacity, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { TicketListItemModel } from "@/models/tickets";
import apiClient from "@/clients/apiClient";
import TicketStatusComponent from "@/components/tickets/TicketStatusComponent";
import moment from "moment";
import { GET_INPROGRESS_TICKETS_DETAILS, GET_USER_DETAILS } from "@/constants/api_endpoints";
import TicketListLayout from '@/components/tickets/TicketListLayout';
import { UserDetailsModel } from '@/models/users'
import { getGreetingMessage } from '@/utils/helper';
const HomeScreen = () => {
    const { ticketId } = useLocalSearchParams();
    const [inProgressTicketDetails, setInProgressTicketDetails] = useState<TicketListItemModel>({});
    const [userDetails, setUserDetails] = useState<UserDetailsModel>({});
    const [isLoading, setIsLoading] = useState(true);

    const { refresh } = useLocalSearchParams();

    useEffect(() => {
        fetchInProgressTicketDetails();
        fetchUserDetails();
    }, []);

    const fetchInProgressTicketDetails = () => {
        apiClient.get(GET_INPROGRESS_TICKETS_DETAILS)
            .then((response) => {
                const content = response.data?.data?.content;
                console.log("inProgressTicketDetails", content);

                if (content && content.length > 0) {
                    const ticketData = content[0] ?? {};
                    setInProgressTicketDetails(ticketData);
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching tickets", error);
                setIsLoading(false);
            });
    };

    const fetchUserDetails = () => {
        apiClient.get(GET_USER_DETAILS)
            .then((response) => {
                console.log(response.data?.data);
                const userData = response.data.data ?? {};
                setUserDetails(userData);
            })
            .catch((error) => {
                console.error("Error fetching user details", error);
            });
    };

    return (
        <SafeAreaView>
            <View className='py-4'>
                <View className="flex px-4 ">
                    <Text className="text-2xl font-bold">
                        {getGreetingMessage()}{" "}👋
                    </Text>
                    <Text className="text-md text-gray-900 font-semibold mt-[2px]">
                        {userDetails?.firstName ?? ""} {userDetails?.lastName ?? ""}
                    </Text>
                </View>
                {inProgressTicketDetails.id &&
                    <Pressable
                        className="w-full mt-4 px-4"
                        onPress={() => {
                            router.push({
                                pathname: "/ticket_details/[ticketId]",
                                params: { ticketId: inProgressTicketDetails.id ?? "" },
                            });
                        }}
                    >
                        <View className="bg-white px-4 py-3 rounded-lg w-full">
                            <View className="flex">
                                <View className="flex-row justify-between w-full">
                                    <View>
                                        <Text className="text-gray-900 font-bold">
                                            {inProgressTicketDetails.ticketNo ?? "-"}
                                        </Text>
                                        <Text className="text-gray-500 text-[13px] mt-[1px]">
                                            Issue in {inProgressTicketDetails.issueTypeDetails?.name ?? "-"}
                                        </Text>
                                    </View>
                                    <TicketStatusComponent
                                        statusKey={inProgressTicketDetails.statusDetails?.key ?? ""}
                                        statusValue={inProgressTicketDetails.statusDetails?.value ?? ""}
                                    />
                                </View>
                                <View className="border-dashed border-[1px] border-gray-300 h-[1px] mt-3 mb-3 w-full" />
                                <View className="w-full">
                                    <View className="flex-row inProgressTicketDetailss-center justify-between">
                                        <View className="flex">
                                            <Text className="text-gray-500 text-md">
                                                Raised by
                                            </Text>
                                            <Text className="text-md text-gray-900 font-semibold mt-[2px]">
                                                {inProgressTicketDetails.customerDetails?.firstName ?? ""} {inProgressTicketDetails.customerDetails?.lastName ?? ""}
                                            </Text>
                                        </View>
                                        <View className="flex inProgressTicketDetailss-end">
                                            <Text className="text-gray-500 text-md">
                                                Raised At
                                            </Text>
                                            <Text className="text-md text-gray-900 font-semibold mt-[2px]">
                                                {inProgressTicketDetails.createdAt ? moment(Number.parseInt(inProgressTicketDetails.createdAt)).fromNow() : "-"}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Pressable>}
                <TicketListLayout />
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;
