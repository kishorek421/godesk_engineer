// (auth)
export const LOGIN = "/login/user_login";
export const VALIDATE_TOKEN = "/login/validate";
export const REFRESH_TOKEN = "/login/refresh_token";

// configurations
export const GET_CONFIGURATIONS_BY_CATEGORY =
  "/configurations/getConfigurationsForDropdown";
  export const GET_CONFIGURATIONS_BY_LIST = "/configurations/list" 
// tickets
export const GET_ASSIGNED_TICKETS_LIST = "/tickets/getAssignedTicketsList";
export const TICKET_UPLOADS = "/tickets/upload";
export const GET_TICKET_DETAILS = "/tickets/getTicketById";
export const GET_CLOSED_TICKETS_LIST = "/tickets/getClosedTicketsList";
export const GET_NOT_COMPLETED_TICKETS_LIST = "tickets/getOnHoldTicketsList";
export const GET_INPROGRESS_TICKETS_DETAILS ="/tickets/getInProgressTicketDetails";
export const UPDATE_TICKET_STATUS ="/tickets/updateTicketStatus"

//user list

export const GET_USER_DETAILS = "/users/view";

export const GET_CUSTOMER_DETAILS = "/customers/list";