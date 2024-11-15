import { GET_ASSIGNED_TICKETS_LIST, GET_TICKET_DETAILS } from "@/constants/api_endpoints";
import { ApiResponseModel, PaginatedData } from "@/models/common";
import apiService from "./base_api_service";
import { isTickeApiServiceMock } from "@/config/env";
import { TicketListItemModel } from "@/models/tickets";
import { getMockAssignedTicketDetails, getMockAssignedTickets } from "./mock/mock_tickets_api_service";

export const getTicketLists = async (currentPage: number, endPoint: string): Promise<any> => {
    return isTickeApiServiceMock ? {
        data: await getMockAssignedTickets(),
    } : apiService
        .get(endPoint, {
            params: {
                pageNo: currentPage,
                pageSize: 10,
            },

        });
}

export const getTicketDetails = async (ticketId: string): Promise<any> => {
    return isTickeApiServiceMock ? {
        data: await getMockAssignedTicketDetails(),
    } : apiService
        .get(GET_TICKET_DETAILS, {
            params: {
                ticketId: ticketId,
            },
        });
}