import { useEffect, useState } from "react";
import { TicketListItemModel } from "@/models/tickets";
import { FlatList, View, Text, RefreshControl } from "react-native";
import api from "@/clients/apiClient";
import {
  GET_TICKETS_BY_STATUS_KEY,
} from "@/constants/api_endpoints";
import TicketListItemLayout from "../tickets/TicketListItemLayout";
import React from "react";
import useRefresh from "@/hooks/useRefresh";
import BasePage from "../base/base_page";
import PrimaryText from "../PrimaryText";
import { useFocusEffect, useLocalSearchParams } from "expo-router";

const RecentTicketHistoryLayout = ({
  placing,
  refreshFlag,
  setRefreshFlag,
}: {
  placing: string;
  refreshFlag: boolean;
  setRefreshFlag: any;
}) => {
  const [recentTickets, setRecentTickets] = useState<TicketListItemModel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  // const { refreshFlag, setRefreshFlag } = useRefresh();
  const [refreshing, setRefreshing] = useState(true);
  const { ticketId } = useLocalSearchParams();
  useEffect(() => {
    fetchTickets(1);
  }, []);

  useEffect(() => {
    //console.log("("("refreshFlag", refreshFlag);

    if (refreshFlag) {
      fetchTickets(1);
    }
  }, [refreshFlag]);

  const fetchTickets = (nextPageNumber: number) => {
    setRefreshing(true);
    api
      .get(GET_TICKETS_BY_STATUS_KEY, {
        params: {
          status: "",
          pageNo: nextPageNumber,
          pageSize: placing === "home" ? 3 : 10,
        },
      })
      .then((response) => {
        let content = response.data?.data?.content ?? [];
        //console.log("("("content ticket////////////------------>", content);
        if (nextPageNumber === 1) {
          setRecentTickets(content);
        } else {
          setRecentTickets((prevState) => [...prevState, ...content]);
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
      });
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchTickets(1);
    }, []),
  );
  return recentTickets.length === 0 ? (
    <BasePage>
      <View
        className={` bg-gray-200 flex justify-center items-center rounded-lg h-36 mb-4 ${
          placing === "home" ? "mx-4 mt-0" : "mx-4 mt-4"
        }`}
      >
        <PrimaryText className="text-gray-500 text-sm text-center font-regular">
          No Recent Ticket Found
        </PrimaryText>
      </View>
    </BasePage>
  ) : (
    <FlatList
      data={recentTickets}
      renderItem={({ item, index }) => (
        <TicketListItemLayout
          cn={`my-2  px-4`}
          ticketModel={item}
        />
      )}
      numColumns={1}
      scrollEnabled={placing !== "home"}
      // className={`${placing === "home" ? "h-96 mb-16" : ""}`}
      keyExtractor={(_, index) => index.toString()}
      onEndReached={() => {
        if (placing !== "home" && !isLastPage) {
          fetchTickets(currentPage + 1);
        }
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            fetchTickets(1);
          }}
        />
      }
      ListFooterComponent={<View style={{ height: placing === "home" ? 8 : 140 }} />}
    />
  );
};

export default RecentTicketHistoryLayout;
