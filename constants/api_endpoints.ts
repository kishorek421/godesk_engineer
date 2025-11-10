// (auth)
export const LOGIN = "/login/user_login";
export const VALIDATE_TOKEN = "/login/validate";
export const REFRESH_TOKEN = "/login/refresh_token";
export const RESET_PASSWORD = "/userProfile/forgotPassword/resetPassword";
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
export const UPDATE_TICKET_STATUS ="/tickets/updateTicketStatus";
export const GET_WORK_COMPLETED_TICKETS_LIST = "/tickets/getWorkCompletedTicketsList";
export const GET_PAID_TICKETS_LIST = "/tickets/getPaidTicketsList";
export const GET_OPENED_TICKETS_LIST="/tickets/getOpenedTicketsList";

//user list
export const GET_CUSTOMER_LEAD_DETAILS = "/customers/leads/view";
export const GET_USER_DETAILS = "/users/view";
export const GET_CUSTOMER_DETAILS = "/customers/list";

// check in out
export const CHECK_IN_OUT = "/attendanceTransaction/createORUpdateAttendanceTransaction";
export const GET_CHECK_IN_OUT_STATUS = "/attendanceTransaction/checkAttendanceStatusByEmployeeId";
export const GET_ATTENDANCE_TRANSACTION = "/attendanceTransaction/getAttendanceTransaction";
export const GET_ORDER_PRODUCTS_OF_TICKET  =
  "/orderAndPayment/getOrderProductsOfTicket";


  //notification
  export const GET_ALL_NOTIFICATIONS = "/notifications/getNotifications";
export const REMOVE_ALL_NOTIFICATIONS =
  "/notifications/updateOrRemoveNotifications";
export const DELETE_CUSTOMER = "/customers/deleteB2cUser";
// modules
export const GET_LOGINED_USER_MODULES =
  "/rbac/roles/getLoginedUserRoleModulePermissionsAsTree";
  export const GET_TICKETS_BY_STATUS_KEY = "/tickets/users/getTicketsByStatusKey";
  // Leave
export const CREATE_LEAVE_REQUEST = "/leave/leaveRequest/create";
export const GET_LEAVE_REQUEST_DETAILS = "/leave/leaveRequest/view";
export const GET_LEAVE_REQUEST_LIST = "/leave/leaveRequest/list";
export const UPDATE_LEAVE_STATUS = "/leave/leaveRequest/updateStatus";
export const GET_LEAVE_REQUEST_PREVIEW = "/leave/leaveRequest/preview";
export const GET_LEAVE_TYPES = "/leave/leaveTypeMaster/getLeavesDropdown";
export const UPDATE_LEAVE_REQUEST = "/leave/leaveRequest/update";
export const CHANGE_PASSWORD = "/userProfile/changeLoginPassword";