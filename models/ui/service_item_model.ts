import { ReactElement } from "react";

export interface ServiceItemModel {
  label?: string;
  icon?: ReactElement;
  path?: string;
  params?: {};
  code?: string;
}
