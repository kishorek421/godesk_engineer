import { View, Text, FlatList, SafeAreaView, TouchableOpacity, Pressable } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, router, Link } from 'expo-router';
import { TicketListItemModel } from "@/models/tickets";
import apiClient from "@/clients/apiClient";
import TicketStatusComponent from "@/components/tickets/TicketStatusComponent";
import moment from "moment";
import { GET_CHECK_IN_OUT_STATUS, GET_INPROGRESS_TICKETS_DETAILS, GET_USER_DETAILS } from "@/constants/api_endpoints";
import TicketListLayout from '@/components/tickets/TicketListLayout';
import { CheckInOutStatusDetailsModel, UserDetailsModel } from '@/models/users';
import { getGreetingMessage } from '@/utils/helper';
import { Button, ButtonText } from '@/components/ui/button';
import CheckInOutModal from '@/components/home/CheckInOutModal';

const HomeScreen = () => {
    const { ticketId } = useLocalSearchParams();
    const [inProgressTicketDetails, setInProgressTicketDetails] = useState<TicketListItemModel>({});
    const [userDetails, setUserDetails] = useState<UserDetailsModel>({});
    const [isLoading, setIsLoading] = useState(true);

    const { refresh } = useLocalSearchParams();

    const bottomSheetRef = useRef(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [checkInOutStatusDetails, setCheckInOutStatusDetails] =
        useState<CheckInOutStatusDetailsModel>({});

    const toggleImagePicker = () => {
        setIsModalVisible(!isModalVisible);
        if (!isModalVisible) {
            bottomSheetRef.current?.show();
        } else {

            bottomSheetRef.current?.hide();
        }
      
    };

    useEffect(() => {
        fetchInProgressTicketDetails();
        fetchUserDetails();
    }, []);

    const fetchCheckInOutStatus = async () => {
        apiClient
            .get(GET_CHECK_IN_OUT_STATUS)
            .then((response) => {
                console.log("checkInDetails", response.data.data);
                const data = response.data?.data;
                if (data) {
                    setCheckInOutStatusDetails(data);
                }
            })
            .catch((e) => {
                console.error(e.response.data);
            });
    };

    useEffect(() => {
        fetchCheckInOutStatus();
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
            <View className="p-1 mt-6">
                <View className='flex-row justify-between items-center'>
                    <View className="flex px-4">
                        <Text className="text-md font-bold mx-2">
                            {getGreetingMessage()} 👋
                        </Text>
                        <Text className="text-md text-primary-950 font-semibold mx-2 mt-[2px]">
                            {userDetails?.firstName ?? ""} {userDetails?.lastName ?? ""}
                        </Text>
                    </View>
                    {checkInOutStatusDetails.value !== "Checked Out" && (
                        <View className="me-4">
                            <Button
                                className="bg-primary-950 rounded-lg mx-2"
                                onPress={() => {
                                    toggleImagePicker();
                                }}
                            >
                                <ButtonText>
                                    {checkInOutStatusDetails.value === "Checked In"
                                        ? "Check Out"
                                        : "Check In"}
                                </ButtonText>
                            </Button>
                        </View>
                    )}
                </View>
                {isLoading ? (
                    <Text className="text-gray-500 text-center mt-6">Loading...</Text>
                ) : inProgressTicketDetails.id && (
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
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex">
                                            <Text className="text-gray-500 text-md">
                                                Raised by
                                            </Text>
                                            <Text className="text-md text-gray-900 font-semibold mt-[2px]">
                                                {inProgressTicketDetails.customerDetails?.firstName ?? ""} {inProgressTicketDetails.customerDetails?.lastName ?? ""}
                                            </Text>
                                        </View>
                                        <View className="flex items-end">
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
                    </Pressable>
                )}
                {/* (
                    <View className="flex h-32 justify-center items-center mt-4 mx-4 bg-gray-200 rounded-lg">
                        <Text className="text-gray-400 text-md text-center">
                            No InProgress Ticket found
                        </Text>
                    </View>
                ) */}
                <TicketListLayout />
            </View>
            <CheckInOutModal
                setIsModalVisible={setIsModalVisible}
                bottomSheetRef={bottomSheetRef}
                status={checkInOutStatusDetails.value}
                checkedInId={checkInOutStatusDetails.id}
                onClose={() => {
                    toggleImagePicker(); 
                    fetchCheckInOutStatus(); 
                }}
            />
        </SafeAreaView>
    );
};

export default HomeScreen;
