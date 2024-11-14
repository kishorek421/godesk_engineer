import { useEffect, useState } from "react";
import TicketListItemLayout from "@/components/tickets/TicketListItemLayout";
import { FlatList } from "react-native";
import { GET_ASSIGNED_TICKETS_LIST, GET_CLOSED_TICKETS_LIST, GET_NOT_COMPLETED_TICKETS_LIST } from "@/constants/api_endpoints";
import { TicketListItemModel } from "@/models/tickets";
import apiService from "@/services/api/base_api_service";
import { getTicketLists } from "@/services/api/tickets_api_service";

const TicketListLayout = () => {
  const [recentTickets, setRecentTickets] = useState<TicketListItemModel[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);

  useEffect(() => {
    fetchTickets(1);
  }, []);

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
  }

  const fetchTickets = (nextCurrentPage: number) => {
    
    getTicketLists(nextCurrentPage, getEndPoint()).then((response: any) => {
      let content = response.data?.data?.content ?? [];
      console.log("content ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~>", content);
      if (content && content.length > 0) {
        if (nextCurrentPage === 1) {
          setRecentTickets(content);
        } else {
          setRecentTickets((prevState) => [...prevState, ...content]);
        }
      } else if (nextCurrentPage === 1) {
        setRecentTickets([]);
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
    })
      .catch((e: any) => {
        console.error(e);
      });
  };

  return (
    <FlatList
      data={recentTickets}
      renderItem={({ item }) => (
        <TicketListItemLayout
          cn={`"m-3"}`}
          ticketModel={item}
        />
      )}
      className={`my-4 h-96`}
      keyExtractor={(_, index) => index.toString()}
      onEndReached={() => {
        if (!isLastPage) {
          fetchTickets(currentPage + 1);
        }
      }}
    />
  );
};

export default TicketListLayout;
