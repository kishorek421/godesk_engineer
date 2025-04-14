import { ConfigurationModel } from "./configurations";
import { RoleModel } from "./rbac";

export interface NotificationItemModel {
  id?: string;
  title?: string;
  message?: string;
  type?: string;
  subType?: string;
  router?: string;
  userId: string;
  notificationId?:string;
  roleDetails?: RoleModel;
  notificationType?: ConfigurationModel;
  isRead?: boolean;
  createdAt?: number;
  modifiedAt?: number;
}

