import React, { useEffect, useState } from "react";
import { FlatList, Text, View, TouchableOpacity } from "react-native";
import TicketListItemLayout from "@/components/tickets/TicketListItemLayout";
import {
  GET_ASSIGNED_TICKETS_LIST,
  GET_CLOSED_TICKETS_LIST,
  GET_NOT_COMPLETED_TICKETS_LIST,
} from "@/constants/api_endpoints";
import { getTicketLists } from "@/services/api/tickets_api_service";
import { TicketListItemModel } from "@/models/tickets";

const TicketListLayout = () => {
  const [recentTickets, setRecentTickets] = useState<TicketListItemModel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const [selectedTab, setSelectedTab] = useState(1); // Track selected tab (1 = Assigned, 2 = Closed, 3 = Not Completed)

  useEffect(() => {
    fetchTickets(1, selectedTab);
  }, [selectedTab]);

  const getEndPoint = (selectedTab?: number): string => {
    switch (selectedTab) {
      case 1:
        return GET_ASSIGNED_TICKETS_LIST;
      case 2:
        return GET_CLOSED_TICKETS_LIST;
      case 3:
        return GET_NOT_COMPLETED_TICKETS_LIST;
      default:
        return "";
    }
  };

  const fetchTickets = (nextCurrentPage: number, selectedTab: number) => {
    console.log("fetching tickets");

    // Get the correct endpoint based on the tab number
    const endpoint = getEndPoint(selectedTab);

    getTicketLists(nextCurrentPage, 10, endpoint)
      .then((response: any) => {
        const content = response?.data?.data?.content ?? [];
        console.log("Fetched Tickets: ", content);

        if (content && content.length > 0) {
          if (nextCurrentPage === 1) {
            setRecentTickets(content);
          } else {
            setRecentTickets((prevState) => [...prevState, ...content]);
          }
        } else if (nextCurrentPage === 1) {
          setRecentTickets([]); // Reset tickets if no content found
        }

        const paginator = response?.data?.paginator;
        if (paginator) {
          const iCurrentPage = paginator.currentPage;
          setIsLastPage(paginator.lastPage ?? true);
          if (iCurrentPage) {
            setCurrentPage(iCurrentPage);
          }
        } else {
          setIsLastPage(true);
        }
      })
      .catch((e: any) => {
        console.error("Error fetching tickets:", e);
      });
  };

  return (
    <>
      {/* Tab buttons to switch between different ticket types */}
      <View className="flex flex-row justify-between py-3 px-4 rounded-full w-full">
        <TouchableOpacity
          onPress={() => setSelectedTab(1)}
          className={`p-3 rounded-full w-28 ${selectedTab === 1 ? "bg-primary-200" : "bg-gray-200"
            }`}
        >
          <Text
            className={`text-center ${selectedTab === 1
              ? "text-primary-950 font-medium"
              : "text-gray-500 font-normal text-sm"
              }`}
          >
            Assigned
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedTab(2)}
          className={`p-3 rounded-full w-28 ${selectedTab === 2 ? "bg-primary-200" : "bg-gray-200"
            }`}
        >
          <Text
            className={`text-center ${selectedTab === 2
              ? "text-primary-950 font-medium"
              : "text-gray-500 font-normal text-sm"
              }`}
          >
            Completed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedTab(3)}
          className={`p-3 rounded-full w-28 ${selectedTab === 3 ? "bg-primary-200" : "bg-gray-200"
            }`}
        >
          <Text
            className={`text-center ${selectedTab === 3
              ? "text-primary-950 font-medium"
              : "text-gray-500 font-normal text-sm"
              }`}
          >
            Not Closed
          </Text>
        </TouchableOpacity>
      </View>
      {recentTickets.length === 0 ? (
        <View className=" justify-center items-center mt-6 mb-72 mx-4 px-6 py-14 bg-gray-300 rounded-lg shadow-md border border-gray-200">
          <Text className="text-gray-500 text-lg text-center">
            No {selectedTab === 1 ? "Assigned" : selectedTab === 2 ? "Completed" : "Not Closed"} tickets 
          </Text>
        </View>
      ) : (
        <FlatList
          data={recentTickets}
          renderItem={({ item }) => (
            <TicketListItemLayout cn={`my-2 mx-4`} ticketModel={item} />
          )}
          keyExtractor={(_, index) => index.toString()}
          onEndReached={() => {
            if (!isLastPage) {
              fetchTickets(currentPage + 1, selectedTab); // Fetch next page based on selected tab
            }
          }}
        />
      )}
    </>
  );
};

export default TicketListLayout;
