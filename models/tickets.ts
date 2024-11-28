import {
  AssetInUseListItemModel,
  AssetSubTypeListItemModel,
  AssetInUseCustomerDetailsModel,
} from "./assets";
import { ConfigurationModel } from "./configurations";
import { EmployeeDetailsModel } from "./employees";

export interface TicketListItemModel {
  id?: string;
  description?: string;
  dueBy?: string;
  assetInUseDetails?: AssetInUseListItemModel;
  assetSubTypeDetails?: AssetSubTypeListItemModel;
  statusDetails?: ConfigurationModel;
  priorityDetails?: ConfigurationModel;
  ticketTypeDetails?: ConfigurationModel;
  serviceTypeDetails?: ConfigurationModel;
  warrantyDetails?: ConfigurationModel;
  customerDetails?: AssetInUseCustomerDetailsModel;
  issueTypeDetails?: IssueTypeModel;
  billable?: boolean;
  timerRunning?: boolean;
  createdAt?: string;
  ticketNo?: string;
  assignedToDetails?: EmployeeDetailsModel;
  ticketImages?: string[];
  lastAssignedToDetails?: AssignedToUserDetailsModel;

  
}

export interface AssignedToUserDetailsModel {
  assignedAt?: string | null;
  assignedTo?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
}


export interface IssueTypeModel {
  id?: string;
  name?: string;
  code?: string;
}