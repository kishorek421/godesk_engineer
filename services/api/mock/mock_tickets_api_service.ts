import { ApiResponseModel, PaginatedData, PaginatorModel } from "@/models/common";
import { TicketListItemModel } from "@/models/tickets";

const tickets: TicketListItemModel[] = [
    {
        id: "ticketId",
        description: "Issue in my display",
        ticketNo: "TK0001",
        assetInUseDetails: {
            id: "asset_id",
            serialNo: "ASERKGK123AKD",
            assetMasterDetails: {
                serialNo: "ASERKGK123AKD",
                assetTypeDetails: {
                    name: "Laptop"
                }
            },
        },
        issueTypeDetails: {
            value: "Power supply"
        },
        createdAt: "1728320332221",
        statusDetails: {
            id: "",
            key: "TICKET_ASSIGNED",
            value: "Assigned",
        }
    }
];

export const getMockAssignedTickets = async (): Promise<ApiResponseModel<PaginatedData<TicketListItemModel[]>>> => {
    return Promise.resolve({
        data: {
            content: tickets,
            pagination: {
                currentPage: 1,
                lastPage: true,
            }
        },
        success: true,
    });
}

export const getMockAssignedTicketDetails = async (): Promise<ApiResponseModel<TicketListItemModel>> => {
    return Promise.resolve({
        data: tickets[0],
        success: true,
    });
}