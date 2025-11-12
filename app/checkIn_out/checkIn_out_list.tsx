import { useEffect, useState } from "react";
import { TicketListItemModel } from "@/models/tickets";
import { FlatList, View, Text, RefreshControl } from "react-native";
import api from "@/clients/apiClient";
import { GET_CHECK_IN_OUT_STATUS} from "@/constants/api_endpoints";
import CheckInListItemLayout from "@/components/checkIn_out/checkInOutLayout";
import React from "react";
import { useFocusEffect } from "expo-router";
import BasePage from "@/components/base/base_page";
import { CheckInOutStatusDetailsModel } from "@/models/users";
import LoadingBar from "@/components/LoadingBar";

const AttendanceHistoryLayout = ({
  placing,
  refreshFlag,
  setRefreshFlag,
}: {
  placing: string;
  refreshFlag: boolean;
  setRefreshFlag: any;
}) => {
  const [attendance, setAttendance] = useState<CheckInOutStatusDetailsModel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchAttendance(1);
  }, []);

  useEffect(() => {
    console.log("refreshFlag", refreshFlag);

    if (refreshFlag) {
      fetchAttendance(1);
    }
  }, [refreshFlag]);

  const fetchAttendance = (nextPageNumber: number) => {
  setRefreshing(true);
  api
    .get('/attendanceTransaction/getAttendanceTransaction',{
        params: {
          pageNo: nextPageNumber,
          pageSize: 10,
        },
      })
    .then((response) => {
      let content = response.data?.data?.content ?? [];
      console.log("ticket////////////", content);
setIsLoading(false);
      if (nextPageNumber === 1) {
        setAttendance(content);
      } else {
        setAttendance((prevState) => {
          const merged = [...prevState, ...content];
          const unique = merged.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.id === item.id) 
          );
          return unique;
        });
      }

      let paginator = response.data?.data?.paginator;
      if (paginator) {
        let iCurrentPage = paginator.currentPage;
        let iLastPage = paginator.lastPage;
        if (iCurrentPage && iLastPage !== undefined) {
          setCurrentPage(iCurrentPage);
          setIsLastPage(iLastPage);
        }
      }

      setRefreshFlag(false);
      setRefreshing(false);
    })
    .catch((e) => {
      console.error(e);
      setRefreshing(false);
      setIsLoading(false);
    });
};

useFocusEffect(
  React.useCallback(() => {
    fetchAttendance(1);
  }, [])
);
  return isLoading ? (
            <LoadingBar />
          ) :attendance.length === 0 ? (
    <BasePage>
      <View
        className={` bg-gray-200 flex justify-center items-center rounded-lg h-36 mb-4 ${
          placing === "home" ? "mx-4 mt-0" : "mx-4 mt-4"
        }`}
      >
        <Text className="text-gray-500 text-sm text-center font-regular">
          No Data Found
        </Text>
      </View>
    </BasePage>
  ) : (
    <FlatList
      data={attendance}
      renderItem={({ item, index }) => (
        <CheckInListItemLayout data={item}/>
      )}
      numColumns={1}
      keyExtractor={(_, index) => index.toString()}
      onEndReached={() => {
        if (placing !== "home" && !isLastPage) {
          fetchAttendance(currentPage + 1);
        }
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            fetchAttendance(1);
          }}
        />
      }
      ListFooterComponent={<View style={{ height: 140 }} />}
    />
  );
};

export default AttendanceHistoryLayout;
