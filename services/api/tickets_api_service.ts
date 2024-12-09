// base_api_service.ts or wherever you handle your API calls
import apiClient from "@/clients/apiClient";


// Function to fetch ticket lists
export const getTicketLists = async (pageNo: number, pageSize: number, endpoint: string) => {
    try {
       console.log("endpoint" , endpoint);
        const response = await apiClient.get(endpoint, {
            params: { pageNo, pageSize },
        });
        console.log("response data", response.data.data);
        
        return response;
    } catch (error) {
        console.error("Error fetching tickets from endpoint:", error.response);
        throw error;
    }
};

