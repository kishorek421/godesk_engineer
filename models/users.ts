import { ConfigurationModel } from "./configurations";
import { EmployeeDetailsModel } from "./employees";
import { OrgDetailsModel } from "./org";
import { RoleModel } from "./rbac";
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
    roleDetails?: RoleModel[];
  statusDetails?: ConfigurationModel;
  userTypeDetails?: ConfigurationModel;
  orgDetails?: OrgDetailsModel;
}

export interface CreateCheckInOutModel {
  date?: string;
  pincode?: string;
  checkInImage?: string;
  checkOutImage?: string;

}
export interface CheckInOutModel {
  pincodeId?: string;
  cityName?: string;
  pincode?: string;
}

export interface CheckInOutStatusDetailsModel {
  value?: string;
  attendance_status?: string;
  employee_id?: string;
  category?: string;
  id?: string;
  check_in?: string;
  check_out?: string;
   total_hours?:string,
  check_in_image?:any,
  check_out_image?:any,
  date?:string,
  employeeDetails: EmployeeDetailsModel,
  checkInPincodeDetail:CheckInOutModel,
  checkOutPincodeDetail:CheckInOutModel,
   configurationDetails?: ConfigurationModel;
}
