import {
  AssetInUseListItemModel,
  AssetSubTypeListItemModel,
  AssetInUseCustomerDetailsModel,
} from "./assets";
import { ConfigurationModel } from "./configurations";
import { EmployeeDetailsModel } from "./employees";

export interface LocationModel {
  lat?: string;
  long?: string;
}

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
  location?: LocationModel;
}

export interface AssignedToUserDetailsModel {
  assignedAt?: string;
  assignedTo?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface IssueTypeModel {
  id?: string;
  name?: string;
  code?: string;
}