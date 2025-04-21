import { View, Text, FlatList, RefreshControl } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import NotificationsItemLayout from "@/components/notifications/NotificationsItemLayout";
import { NotificationItemModel } from "@/models/notifications";
import {
  REMOVE_ALL_NOTIFICATIONS,
  GET_ALL_NOTIFICATIONS,
} from "@/constants/api_endpoints";
import { Button, ButtonText } from "@/components/ui/button";
import LoadingBar from "@/components/LoadingBar";
import apiClient from "@/clients/apiClient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import PrimaryText from "@/components/PrimaryText";
const AllNotifications = () => {
  const [allNotifications, setAllNotifications] = useState<
    NotificationItemModel[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const swipeableRefs = useRef<Record<string, any>>({});

  const fetchNotifications = (nextPageNumber: number) => {
    if (isLoading) return;

    setRefreshing(true);
    setIsLoading(true);

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

  const removeNotification = async (notificationId: any) => {
    setIsLoading(true);

    try {
      const response = await apiClient.put(REMOVE_ALL_NOTIFICATIONS, {
        performType: "Remove",
        notificationIds: [notificationId],
      });
      console.log("Notification removed successfully:", response);
      if (response.data?.message) {
        console.log(response.data.message);
      }
      setAllNotifications((prevData) =>
        prevData.filter((item) => item.notificationId !== notificationId),
      );
      if (swipeableRefs.current[notificationId]) {
        swipeableRefs.current[notificationId].close();
      }
    } catch (e) {
      if (e instanceof Error) {
        console.error("Error removing notification:", (e as any).response || e.message);
      } else {
        console.error("Error removing notification:", e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  
  const renderItem = ({ item }: { item: NotificationItemModel }) => (
    <Swipeable
      ref={(ref) => (swipeableRefs.current[item.notificationId ?? "unknown"] = ref)}
      renderRightActions={(progress, dragX) => (
        <View className="flex-row justify-center items-center h-full pb-4">
          <Button
            onPress={() => removeNotification(item.notificationId)}
            className="bg-primary-950 rounded-l-none rounded-r-lg h-full "
          >
            <Ionicons name="trash-outline" size={25} color="white" />
          </Button>
        </View>
      )}
    >
      <NotificationsItemLayout item={item} callbackFunc={removeNotification} />
    </Swipeable>
  );

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="h-full">
        {isLoading ? (
          <LoadingBar />
        ) : (
          <View>
            {allNotifications.length > 0 && (
              <View className=" mb-2 px-4 mt-4">
                <Button
                  className="bg-primary-950"
                  onPress={clearAllNotifications}
                >
                  <ButtonText className="font-semibold">
                    Clear All Notifications
                  </ButtonText>
                </Button>
              </View>
            )}
            <View className="h-full">
              {allNotifications.length === 0 ? (
                <View className="h-full flex justify-center items-center rounded-lg">
                  <PrimaryText className="text-gray-500 text-md text-center font-regular">
                    No Recent Notifications
                  </PrimaryText>
                </View>
              ) : (
                <FlatList
                  data={allNotifications}
                  renderItem={renderItem}
                  keyExtractor={(item) => (item.notificationId ?? "").toString()}
                  onEndReached={() => {
                    if (!isLastPage) {
                      fetchNotifications(currentPage + 1);
                    }
                  }}
                  ListFooterComponent={<View style={{ height: 200 }} />}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={() => fetchNotifications(1)}
                    />
                  }
                  className="p-4"
                />
              )}
            </View>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

export default AllNotifications;
