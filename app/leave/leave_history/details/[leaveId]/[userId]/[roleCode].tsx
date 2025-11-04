import { View, Text, ScrollView, RefreshControl, Alert, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import api from "@/clients/apiClient";
import {
  GET_LEAVE_REQUEST_DETAILS,
  GET_CONFIGURATIONS_BY_CATEGORY,
  UPDATE_LEAVE_STATUS,
} from "@/constants/api_endpoints";

import Ionicons from "@expo/vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import { Button, ButtonText } from "@/components/ui/button";

import { LeaveRequestModel } from "@/models/leave";
import LoadingBar from "@/components/LoadingBar";
import LeaveStatusComponent from "@/components/leave/LeaveStatusComponent";
import { UserDetailsModel } from "@/models/users";
import { ConfigurationModel } from "@/models/configurations";
import Feather from "@expo/vector-icons/Feather";
import PrimaryText from "@/components/PrimaryText";
import BasePage from "@/components/base/base_page";
interface LeaveListItemLayoutProps {
  data: LeaveRequestModel;
  userId: string;
  roleCode: string;
}

const DeviceDetailsScreen = ({
  data,

}: LeaveListItemLayoutProps) => {
  const { leaveId, userId, roleCode } = useLocalSearchParams();


  console.log("rolecode",roleCode);
  const [leaveDetails, setLeaveDetails] = useState<LeaveRequestModel>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userTypeDetails, setUserTypeDetails] = useState<UserDetailsModel>({});
  const [leaveStatusConfigs, setLeaveStatusConfigs] = useState<
    ConfigurationModel[]
  >([]);
  const navigation = useNavigation()
  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Leave Details",
      headerTitleAlign: "center",
      headerRight: () => {
        return (
          (leaveDetails.statusDetails?.key === "RAISED" ) &&
          (roleCode !== "CUSTOMER" && roleCode !== "ADMIN") &&
          (
            (roleCode === "SDE" && leaveDetails.employeeDetails?.id === userId) ||
            leaveDetails.employeeDetails?.id === userId
          ) && (
            <Pressable
              onPress={() => {
                router.push({
                  pathname: "/leave/create_leave_request/[leaveId]",
                  params: {
                    leaveId: leaveDetails.id ?? "update",
                    userDetailsModelData: JSON.stringify(leaveDetails),
                  },
                });
              }}
            >
              <Feather name="edit-2" size={20} color="black" />
            </Pressable>
          )
        );
      },
      headerLeft: () => (
        <Pressable
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
      ),
      headerLeftContainerStyle: {
        paddingStart: 10,
      },
    });
  }, [navigation, leaveDetails]);
  
  useEffect(() => {
    getLeaveRequestStatusConfigs();
    fetchLeaveDetailsById();
  }, []);

  const fetchLeaveDetailsById = () => {
    console.log("leaveId", leaveId);

    return api
      .get(GET_LEAVE_REQUEST_DETAILS + `?id=${leaveId}`)
      .then((response) => {
        setIsLoading(false);
        setLeaveDetails(response.data.data ?? {});
      })
      .catch((e) => {
        console.error(e);
        setIsLoading(false);
      });
  };

  const getLeaveRequestStatusConfigs = () => {
    api
      .get(GET_CONFIGURATIONS_BY_CATEGORY + "?category=LEAVE_REQUEST_STATUS")
      .then((response) => {
        console.log("userTypeDetails", response);
        setLeaveStatusConfigs(response.data.data ?? {});
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const updateLeaveStatus = async (statusKey: string) => {
    const statusConfig = leaveStatusConfigs.find(
      (status) => status.key === statusKey
    );

    if (!statusConfig) {
      console.warn("Invalid statusKey:", statusKey);
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.put(
        UPDATE_LEAVE_STATUS + `?id=${leaveId}&statusId=${statusConfig.id}`
      );

      if (response.data) {
        setLeaveDetails(response.data.data ?? {});
      }
      if (statusKey === "APPROVED") {
        Toast.show({
          type: "success",
          text1: "toast39",
          visibilityTime: 5000,
        });
      }
      if (statusKey === "REJECTED") {
        Toast.show({
          type: "success",
          text1: "toast40",
          visibilityTime: 5000,
        });
      }

      fetchLeaveDetailsById();
    } catch (error) {
      console.error("Error updating leave status:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaveDetailsById().finally(() => setRefreshing(false));
  };


  return isLoading ? (
    <LoadingBar />
  ) : (
    <BasePage>
    <ScrollView
         refreshControl={
           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
         }
       >
      <View className="p-4">
        <View className="bg-white px-3 py-3 rounded-lg w-full">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-gray-500 text-md">leaveType</Text>
              <Text className="font-semibold text-gray-900 text-md">
                {leaveDetails.leaveTypeDetails?.value ?? "-"}
              </Text>
            </View>
            <View className="flex items-end">
              <LeaveStatusComponent
                statusKey={leaveDetails.statusDetails?.key}
                statusValue={leaveDetails.statusDetails?.value}
              />
            </View>
          </View>
          <View className="border-[.5px] border-gray-300 mt-1 mb-3 w-full h-[1px]" />
          <View className="w-full mt-1">
            <View className="flex-row justify-between items-center">
              <View className="flex">
<Text className="text-gray-500 text-md">startDate</Text>
<Text className="font-semibold text-gray-900 text-md">
                  {leaveDetails.startDate ?? "-"}
                </Text>
              </View>
              <View className="flex items-end">
<Text className="text-gray-500 text-md">endDate</Text>
<Text className="font-semibold text-gray-900 text-md">
                  {leaveDetails.endDate ?? "-"}
                </Text>
              </View>
            </View>
          </View>

          <View className="border-[.5px] border-gray-300 mt-1 mb-3 w-full h-[1px]" />

          <View className="w-full">
            <View className="flex-row justify-between items-center">
              <View className="flex">
<Text className="text-gray-500 text-md">daysCount</Text>
<Text className="font-semibold text-gray-900 text-md">
                  {leaveDetails.daysCount ?? "-"}
                </Text>
              </View>
              <View className="flex items-end">
<Text className="text-gray-500 text-md">approvedBy</Text>
<Text className="mt-[2px] font-semibold text-gray-900 text-md">
                  {leaveDetails.approvedBy?.name ?? "-"}
                </Text>
              </View>
            </View>
          </View>
          <View className="border-[.5px] border-gray-300 mt-1 mb-3 w-full h-[1px]" />
          <View className="flex-row justify-between items-center">
            <View className="flex">
              <Text className="text-gray-500 text-md">remainingDays</Text>
              <Text className="font-semibold text-gray-900 text-md">
                {leaveDetails.remainingDays ?? "-"}
              </Text>
            </View>
            <View className="flex items-end">
              <Text className="text-gray-500 text-md">lossOfPay</Text>
              <Text className="mt-[2px] font-semibold text-gray-900 text-md">
                {leaveDetails.lossOfPay ?? "-"}
              </Text>
            </View>
          </View>
          {leaveDetails.statusDetails?.key === "RAISED" &&
            (roleCode === "CUSTOMER" ||
              roleCode === "ADMIN" ||
              (roleCode === "SDE" &&
                leaveDetails.employeeDetails?.id !== userId)) && (
              <View className="flex-row justify-between mt-4">
                <Button
                  onPress={() => {
                    Alert.alert(
                      "Confirm",
                      "Are you sure you want to reject this leave request?",
                      [
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                        {
                          text: "Reject",
                          onPress: () => updateLeaveStatus("REJECTED"),
                          style: "destructive",
                        },
                      ]
                    );
                  }}
                  className="bg-red-500 rounded-lg"
                >
                  <ButtonText className="text-white font-semibold">
                    Reject
                  </ButtonText>
                </Button>
                <Button
                  onPress={() => {
                    Alert.alert(
                      "Confirm",
                      "Are you sure you want to approve this leave request?",
                      [
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                        {
                          text: "Approve",
                          onPress: () => updateLeaveStatus("APPROVED"),
                          style: "default",
                        },
                      ]
                    );
                  }}
                  className="bg-green-500 rounded-lg"
                >
                  <ButtonText className="text-white font-semibold">
                    Approve
                  </ButtonText>
                </Button>
              </View>
            )}
        </View>
      </View>
    </ScrollView>
    </BasePage>
  );
};

export default DeviceDetailsScreen;
