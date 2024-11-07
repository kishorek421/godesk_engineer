import { ESCALATED, RAISED, IN_PROGRESS, TICKET_CLOSED, ASSIGNED } from "@/constants/configuration_keys";
import { ErrorModel } from "@/models/common";

export const isFormFieldInValid = (
  name: string,
  errors: ErrorModel[],
): string => {
  let msg = "";
  for (const error of errors) {
    if (error.param === name) {
      msg = error.message ?? "";
    }
  }
  return msg;
};

export const getStatusColor = (statusKey?: string): string => {
  switch (statusKey) {
    case ESCALATED:
      return "color-red-500 bg-red-100";
    case RAISED:
      return "color-blue-500 bg-blue-100";
    case IN_PROGRESS:
      return "color-secondary-950 bg-secondary-100";
    case TICKET_CLOSED:
      return "color-primary-950 bg-primary-100";
    case ASSIGNED :
      return "text-[#040042] bg-[#d2cfff]";
    default:
      return "bg-color-white color-gray-900";
  }
};