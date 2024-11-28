import { ConfigurationModel } from "./configurations";
import { OrgDetailsModel } from "./org";

export interface CreateUserModel {
  firstName?: string;
  lastName?: string;
  mobile?: string;
  email?: string;
  departmentId?: string;
  designationId?: string;
  orgId?: string;
}

export interface UserDetailsModel {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  statusDetails?: ConfigurationModel;
  userTypeDetails?: ConfigurationModel;
  orgDetails?: OrgDetailsModel;
}
