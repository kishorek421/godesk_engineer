import {
  AssetInUseListItemModel,
  AssetSubTypeListItemModel,
  AssetInUseCustomerDetailsModel,
  AssetMasterListItemModel,
} from "./assets";
import { ConfigurationModel } from "./configurations";
import { EmployeeDetailsModel } from "./employees";
import { CustomerDetailsModel } from "./customers";
export interface LocationModel {
  lat?: string;
  long?: string;
}

export interface TicketListItemModel {
  id?: string;
  description?: string;
  dueBy?: string;
  scheduledDate?:string;
  timeSlot?:string;
  assetInUseDetails?: AssetInUseListItemModel;
  assetSubTypeDetails?: AssetSubTypeListItemModel;
  statusDetails?: ConfigurationModel;
  subStatusDetails?:ConfigurationModel;
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
  pin?: string;
  subscription?:boolean;
  customersDetails?:CustomerDetailsModel;
  userTypeDetails?: ConfigurationModel;
  paymentModeDetails?: ConfigurationModel;
}

export interface AssignedToUserDetailsModel {
  assignedAt?: string;
  assignedTo?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}
export interface RatingModel {
  id?: string;
  value?: string;
  description?: string;
  feedback?: string;

}

export interface IssueTypeModel {
  id?: string;
  name?: string;
  code?: string;
}