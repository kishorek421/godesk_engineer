import { View, Text, Pressable, Platform, Modal } from "react-native";
import React, { useEffect, useState } from "react";
import BasePage from "@/components/base/base_page";
import { CheckInOutStatusDetailsModel } from "@/models/users";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import api from "@/clients/apiClient";
import { Image } from "react-native";
import CheckInStatusComponent from "@/components/checkIn_out/CheckInStatusComponent";


const checkInDetailsPage = () => {
  const { checkInId } = useLocalSearchParams();
  console.log("checkInId---->:", checkInId);
  const [employeeDetails, setEmployeeDetails] = useState<CheckInOutStatusDetailsModel>();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAttendanceDetailsById = () => {
    return api
      .get(`/attendanceTransaction/view?id=${checkInId}`)
      .then((response) => {
        setIsLoading(false);
        console.log("response.data.data", response.data.data);
        setEmployeeDetails(response.data?.data ?? {});
      })
      .catch((e) => {
        console.error(e);
        setIsLoading(false);
      });
  };
  useEffect(() => {
    fetchAttendanceDetailsById();
  }, [checkInId]);
  const formatTime = (time?: string) => {
    if (!time) return "-";
    return time.split(".")[0];
  };
  return (
    <BasePage>
      <View className=" bg-white py-1 p-4 rounded-sm mt-2">
        <View className="flex px-4 py-2">
         
          <View className="w-full">
             <CheckInStatusComponent
              statusKey={employeeDetails?.configurationDetails?.key}
              statusValue={employeeDetails?.configurationDetails?.value}
            />
            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-2">
                <Text className="text-gray-500 text-md">Name</Text>
                <Text className="mt-[2px] font-semibold text-gray-900 text-md">
                  {employeeDetails?.employeeDetails?.employeeName ?? "-"}
                </Text>
              </View>
              <View className="flex-1 items-end pl-2">
                <Text className="text-gray-500 text-md">Date</Text>
                <Text className="mt-[2px] font-semibold text-gray-900 text-md">
                  {employeeDetails?.date ?? "-"}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center mt-3">
              <View className="flex-1">
                <Text className="text-gray-500 text-md">Checked In</Text>
                <Text className="mt-[2px] font-semibold text-gray-900 text-md">
                  {formatTime(employeeDetails?.check_in)}
                </Text>
              </View>
              {employeeDetails?.check_out && (
                <View className="items-center ml-3">
                  <View className="w-full border-t border-gray-500 my-1 -mx-2" />
                  <View className="flex-row items-center my-1">

                    <Text className="font-semibold text-gray-900 text-md">
                      {formatTime(employeeDetails?.total_hours)} hrs
                    </Text>
                  </View>
                  <View className="w-full border-t border-gray-500 my-1 -mx-2" />
                </View>
              )}
              <View className="flex-1 items-end">
                <Text className="text-gray-500 text-md">Checked Out</Text>
                <Text className="mt-[2px] font-semibold text-gray-900 text-md">
                  {formatTime(employeeDetails?.check_out)}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between mt-3">
              <View className="flex-1">
                <Text className="text-gray-500 text-md">Checked In Pincode</Text>
                <Text className="mt-[2px] font-semibold text-gray-900 text-md">
                  {employeeDetails?.checkInPincodeDetail?.pincode ?? "-"}
                </Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="text-gray-500 text-md">Checked Out Pincode</Text>
                <Text className="mt-[2px] font-semibold text-gray-900 text-md">
                  {employeeDetails?.checkOutPincodeDetail?.pincode ?? "-"}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between mt-3">
              {/* Checked In */}
              <View className="flex-1">
                <Text className="text-gray-500 text-md">Checked In Image</Text>
                {employeeDetails?.check_in_image ? (
                  <Pressable
                    onPress={() => {
                      router.push({
                        pathname: "/image_viewer/[uri]",
                        params: {
                          uri: employeeDetails.check_in_image,
                        },
                      });
                    }}
                  >
                    <Image
                      source={{ uri: employeeDetails.check_in_image }}
                      className="w-20 h-20 mt-2 rounded-lg"
                      resizeMode="cover"
                    />
                  </Pressable>
                ) : (
                  <Text className="mt-[2px] font-semibold text-gray-900 text-md">-</Text>
                )}
              </View>
              <View className="flex-1 items-end">
                <Text className="text-gray-500 text-md">Checked Out Image</Text>
                {employeeDetails?.check_out_image ? (
                  <Pressable
                    onPress={() => {
                      router.push({
                        pathname: "/image_viewer/[uri]",
                        params: {
                          uri: employeeDetails.check_out_image,
                        },
                      });
                    }}
                  >
                    <Image
                      source={{ uri: employeeDetails.check_out_image }}
                      className="w-20 h-20 mt-2 rounded-lg"
                      resizeMode="cover"
                    />
                  </Pressable>
                ) : (
                  <Text className="mt-[2px] font-semibold text-gray-900 text-md">-</Text>
                )}
              </View>
            </View>
          </View>

        </View>
      </View>
    </BasePage>
  );
};

export default checkInDetailsPage;
