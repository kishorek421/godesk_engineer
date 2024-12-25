import React, { useEffect, useState } from "react";
import { FlatList, Text, View, TouchableOpacity } from "react-native";
import TicketListItemLayout from "@/components/tickets/TicketListItemLayout";
import {
  GET_ASSIGNED_TICKETS_LIST,
  GET_CLOSED_TICKETS_LIST,
  GET_NOT_COMPLETED_TICKETS_LIST,
  GET_INPROGRESS_TICKETS_DETAILS,
} from "@/constants/api_endpoints";
import { getTicketLists } from "@/services/api/tickets_api_service";
import { TicketListItemModel } from "@/models/tickets";
import apiClient from "@/clients/apiClient";
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
const TicketListLayout = () => {
  const { t, i18n } = useTranslation();
  const [recentTickets, setRecentTickets] = useState<TicketListItemModel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
 const [selectedLanguage, setSelectedLanguage] = useState('en');
  const tabs = [
  
    t('Assigned'),
    t('Opened'),
    t('Completed'),
    t('Not Closed'),

  ];

  useEffect(() => {
    fetchTickets(1, selectedTab);
   
  }, [selectedTab]);
  useEffect(() => {
    const fetchLanguage = async () => {
      const storedLanguage = await AsyncStorage.getItem('language');
      if (storedLanguage) {
        setSelectedLanguage(storedLanguage);
        i18n.changeLanguage(storedLanguage); // Set language from AsyncStorage
      }
    };

    fetchLanguage();
  }, []);

  const getEndPoint = (selectedTab?: number): string => {
    switch (selectedTab) {
      case 0:
        return GET_ASSIGNED_TICKETS_LIST;
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

  const fetchTickets = async (nextCurrentPage: number, selectedTab: number) => {
    console.log("fetching tickets");

    setRecentTickets([]);

    if (selectedTab === 1) {
      await apiClient.get("/tickets/users/getTicketsByStatusKey?status=OPENED", {
        params: { pageNo: nextCurrentPage, pageSize: 10 },
      }).then((response) => {
        const content = response?.data?.data?.content ?? [];
        console.log("Fetched Tickets: ", content);

        if (content && content.length > 0) {
          if (nextCurrentPage === 1) {
            setRecentTickets(content);
          } else {
            setRecentTickets((prevState: any) => [...prevState, ...content]);
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
      }).catch((e) => {
        console.error(e.response.data);
      });
    } else {
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
              setRecentTickets((prevState: any) => [...prevState, ...content]);
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
    }
  };

  return (
    <>
      {/* Tab buttons to switch between different ticket types */}

      <FlatList
        horizontal
        data={tabs}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()} // Ensure a unique key for each item
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => setSelectedTab(index)}
            className={`ms-4 h-12 py-3 rounded-full w-28 ${selectedTab === index ? "bg-primary-200" : "bg-gray-200"
              }`}
            key={index}
          >
            <Text
              className={` h-96 text-center ${selectedTab === index
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
        <View className="flex h-32 justify-center items-center mt-4 mx-4 bg-gray-200
         rounded-lg
       ">
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
          keyExtractor={(_: any, index: { toString: () => any; }) => index.toString()}
          onEndReached={() => {
            if (!isLastPage) {
              fetchTickets(currentPage + 1, selectedTab);
            }
          }}
          ListFooterComponent={
            <View style={{ height: 500 }} />
          }
          contentContainerStyle={{ paddingTop: 16 }}
        />

      )}
    </>
  );
};

export default TicketListLayout;
