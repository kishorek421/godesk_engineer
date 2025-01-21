import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import TicketListItemLayout from "@/components/tickets/TicketListItemLayout";
import {
  GET_ASSIGNED_TICKETS_LIST,
  GET_CLOSED_TICKETS_LIST,
  GET_NOT_COMPLETED_TICKETS_LIST,
  GET_PAID_TICKETS_LIST,
  GET_WORK_COMPLETED_TICKETS_LIST,
} from "@/constants/api_endpoints";
import { getTicketLists } from "@/services/api/tickets_api_service";
import { TicketListItemModel } from "@/models/tickets";
import apiClient from "@/clients/apiClient";
import { useTranslation } from "react-i18next";

const TicketListLayout = () => {
  const { t } = useTranslation();
  const [recentTickets, setRecentTickets] = useState<TicketListItemModel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  const [refreshing, setRefreshing] = useState(true);

  const tabs = [
    t("Assigned"),
    t("Opened"),
    t("Work Completed"),
    t("Paid"),
    t("Completed"),
    t("Not Closed"),
  ];

  // const  isB2C_USER = true;
  // if ( isB2C_USER) {
  //   setSelectedTab(2); 
  // }

  useEffect(() => {
    fetchTickets(1, selectedTab);
  }, [selectedTab]);

  const getEndPoint = (selectedTab?: number): string => {
    switch (selectedTab) {
      case 0:
        return GET_ASSIGNED_TICKETS_LIST;
      case 1:
        return GET_ASSIGNED_TICKETS_LIST;
      case 2:
        return GET_WORK_COMPLETED_TICKETS_LIST;
      case 3:
        return GET_PAID_TICKETS_LIST;
      case 4:
        return GET_CLOSED_TICKETS_LIST;
      case 5:
        return GET_NOT_COMPLETED_TICKETS_LIST;
      default:
        return "";
    }
  };

  const fetchTickets = async (nextCurrentPage: number, selectedTab: number) => {
    console.log("fetching tickets");

    setRecentTickets([]);

    if (selectedTab === 1) {
      setRefreshing(true);
      await apiClient
        .get("/tickets/users/getTicketsByStatusKey?status=OPENED", {
          params: { pageNo: nextCurrentPage, pageSize: 10 },
        })
        .then((response) => {
          let content = response.data?.data?.content ?? [];
        
          if (nextCurrentPage === 1) {
            setRecentTickets(content);
          } else {
            setRecentTickets((prevState) => [...prevState, ...content]);
          }
          let paginator = response.data?.data?.paginator;

          if (paginator) {
            const iCurrentPage = paginator.currentPage;
            setIsLastPage(paginator.lastPage ?? true);
            if (iCurrentPage) {
              setCurrentPage(iCurrentPage);
            }
          }
        })
        .catch((e) => {
          console.error(e.response.data);
        })
        .finally(() => {
          setRefreshing(false);
        });
    } else {
      const endpoint = getEndPoint(selectedTab);
      getTicketLists(nextCurrentPage, 10, endpoint)
        .then((response: any) => {
          let content = response.data?.data?.content ?? [];
          console.log("Fetched Tickets: ", content);

          if (content && content.length > 0) {
            if (nextCurrentPage === 1) {
              setRecentTickets(content);
            } else {
              setRecentTickets((prevState: any) => [...prevState, ...content]);
            }
          } else if (nextCurrentPage === 1) {
            setRecentTickets([]);
          }
          let paginator = response.data?.data?.paginator;
          if (paginator) {
            const iCurrentPage = paginator.currentPage;
            setIsLastPage(paginator.lastPage ?? true);
            if (iCurrentPage) {
              setCurrentPage(iCurrentPage);
            }
          }
        })
        .catch((e: any) => {
          console.error("Error fetching tickets:", e);
        })
        .finally(() => {
          setRefreshing(false);
        });
    }
  };

  return (
    <>
      <FlatList
        horizontal
        data={tabs}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => setSelectedTab(index)}
            className={`ms-4 h-12 py-2 rounded-full w-32 mb-8 ${
              selectedTab === index ? "bg-primary-200" : "bg-gray-200"
            }`}
            key={index}
          >
            <Text
              className={` h-96 text-center ${
                selectedTab === index
                  ? "text-primary-950 font-medium"
                  : "text-gray-500 font-normal text-sm"
              }`}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        className="mt-6"
      />
      {recentTickets.length === 0 ? (
        <View className="flex h-32 justify-center items-center mt-1 mx-4 bg-gray-200 rounded-lg">
          <Text className="text-gray-400 text-md text-center">
            No tickets found
          </Text>
        </View>
      ) : (
        <FlatList
          data={recentTickets}
          renderItem={({ item }) => (
            <TicketListItemLayout cn={`my-2 `} ticketModel={item} />
          )}
          keyExtractor={(_: any, index: { toString: () => any }) =>
            index.toString()
          }
          onEndReached={() => {
            if (!isLastPage) {
              fetchTickets(currentPage + 1, selectedTab);
            }
          }}
          ListFooterComponent={<View style={{ height: 600 }} />}
          contentContainerStyle={{ paddingTop: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                fetchTickets(1, selectedTab);
              }}
            />
          }
        />
      )}
    </>
  );
};

export default TicketListLayout;
