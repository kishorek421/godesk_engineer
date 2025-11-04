import { ConfigurationModel } from "./configurations";
import { EmployeeDetailsModel } from "./employees";
import { OrgDetailsModel } from "./org";
import { RoleModel } from "./rbac";

export interface CreateLeaveRequestModel{
    leaveTypeId?: string;
    startDate?: string;
    endDate?: string;
    reason?: string;
}
export interface LeaveTypeModel{
    id ?:string;
    key?:string;
    value?:string;
    lable?:string;
}
export interface LeaveRequestModel{
    id?: string;
   
    leaveTypeDetails?: ConfigurationModel;
    startDate?: string;
    endDate?: string;
    reason?: string;
    daysCount?: number;
    remainingDays?: number;
    lossOfPay?:number;
    approvedBy?: EmployeeDetailsModel; 
    employeeDetails?: EmployeeDetailsModel;
    approvedDate?: string;
    orgDetails?:OrgDetailsModel;
    statusDetails?: ConfigurationModel;
    roleDetails?: RoleModel;
}
export interface LeaveRequestDetailsModel{
    allowedDays? :number;
    remainingDays? :number;
    lossOfPay: number;
}