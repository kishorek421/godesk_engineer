import { View, Text, FlatList, RefreshControl,Pressable } from "react-native";
import React, { useState, useEffect } from "react";
import TicketListItemLayout from "@/components/tickets/TicketListItemLayout";
import NotificationsItemLayout from "@/components/notifications/NotificationsItemLayout";
import { NotificationItemModel } from "@/models/notifications";
import {
  GET_ALL_NOTIFICATIONS,
  REMOVE_ALL_NOTIFICATIONS,
} from "@/constants/api_endpoints";
import { Button, ButtonText } from "@/components/ui/button";
import LoadingBar from "@/components/LoadingBar";
import apiClient from "@/clients/apiClient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { router } from "expo-router";

const AllNotifications = () => {
  const [allNotifications, setAllNotifications] = useState<
    NotificationItemModel[]
  >([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = (nextPageNumber: number) => {
    setRefreshing(true);
    setIsLoading(true);
    setAllNotifications([])
    apiClient
      .get(GET_ALL_NOTIFICATIONS, {
        params: {
          status: "",
          pageNo: nextPageNumber,
          pageSize: 10,
        },
      })
      .then((response) => {
        let content = response.data?.data?.content ?? [];
        console.log("content notification////////////------------>", content);
        if (nextPageNumber === 1) {
          setAllNotifications(content);
        } else {
          setAllNotifications((prevState) => [...prevState, ...content]);
        }
        let paginator = response.data?.data?.paginator;
        if (paginator) {
          let iCurrentPage = paginator.currentPage;
          let iLastPage = paginator.lastPage;
          if (iCurrentPage && iLastPage !== undefined) {
            setCurrentPage(iCurrentPage);
            setIsLastPage(iCurrentPage >= iLastPage);
          }
        }
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setIsLoading(false);
        setRefreshing(false);
      });
  };

  const clearAllNotifications = () => {
    setIsLoading(true);

    apiClient
      .put(REMOVE_ALL_NOTIFICATIONS, {
        performType: "ClearAll",
        notificationIds: [],
      })
      .then((response) => {
        console.log("response", response);
        setAllNotifications([]);
      })
      .catch((e) => {
        console.error(e.response);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  return (
    <View className="h-full ">
       <Pressable
        onPress={() => {
          router.push({
            pathname: "../home",
            params: {
              refresh: "true",
            },
          });
        }}
      >
        <View className="flex-row items-center bg-white h-14 px-4">
          <View className="flex-row items-center flex-1">
            <MaterialIcons name="arrow-back-ios" size={20} color="black" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-lg text-center">
              Notifications
            </Text>
          </View>
          <View className="flex-1"></View>
        </View>
      </Pressable>
      {isLoading ? (
        <View>
          <LoadingBar />
        </View>
      ) : (
        <View>
          {allNotifications.length > 0 && (
            <View className=" mb-2 px-4 mt-4">
              <Button
                className="bg-primary-950"
                onPress={clearAllNotifications}
              >
                <ButtonText className="font-semibold">
                  Clear All Notification
                </ButtonText>
              </Button>
            </View>
          )}
          <View className="h-full ">
            {allNotifications.length === 0 ? (
              <View
                className={`h-full flex justify-center items-center rounded-lg `}
              >
                <Text className="text-gray-500 text-md text-center font-regular">
                  No Recent Notifications
                </Text>
              </View>
            ) : (
              <FlatList
                data={allNotifications}
                renderItem={({ item, index }) => (
                  <NotificationsItemLayout item={item} />
                )}
                keyExtractor={(_, index) => index.toString()}
                onEndReached={() => {
                  if (!isLastPage) {
                    fetchNotifications(currentPage + 1);
                  }
                }}
                ListFooterComponent={<View style={{ height: 200 }} />}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                      fetchNotifications(1);
                    }}
                  />
                }
                className="p-4"
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default AllNotifications;