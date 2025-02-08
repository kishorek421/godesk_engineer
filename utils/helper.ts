import { ESCALATED, RAISED, TICKET_IN_PROGRESS, TICKET_CLOSED, ASSIGNED } from "@/constants/configuration_keys";
import { ErrorModel } from "@/models/common";
import moment from "moment";
import { useTranslation } from 'react-i18next';
export const isFormFieldInValid = (
  name: string,
  errors: ErrorModel[],
): string => {
  //console.log("checking error", name);
  
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
    case TICKET_IN_PROGRESS:
      return "color-secondary-950 bg-secondary-100";
    case TICKET_CLOSED:
      return "color-primary-950 bg-primary-100";
    case ASSIGNED :
      return "text-[#040042] bg-[#d2cfff]";
    default:
      return "bg-color-white color-gray-900";
  }
};

export function getGreetingMessage() {
  const currentHour = moment().hour();
  const { t, i18n } = useTranslation();
  if (currentHour >= 5 && currentHour < 12) {
    return t('goodMorning'); 
  } else if (currentHour >= 12 && currentHour < 17) {
    return t('goodAfternoon'); 
  } else if (currentHour >= 17 && currentHour < 21) {
    return t('goodEvening'); 
  } else {
    return t('hello'); 
  }
}

export const getFileName = (uri: string, isFullName = false) => {
  const splits = uri.split("/");
  const fileName = splits[splits.length - 1];
  return isFullName
    ? fileName
    : fileName.length > 17
      ? fileName.substring(17) + "..."
      : fileName;
};

export function bytesToMB(bytes: number) {
  return bytes / (1024 * 1024);
}


export const setErrorValue = (
  param: string,
  value: string,
  msg: string,
  setErrors: any,
) => {
  setErrors((prevState: ErrorModel[]) => {
    // to check whether field is present or not
    let isFieldExist = false;

    // find error and assign the message to field
    for (const e of prevState) {
      let eParam = e.param;
      if (eParam === param) {
        e.message = msg;
        e.value = value;
        isFieldExist = true;
        break;
      }
    }

    // if isFieldExist not exist
    if (!isFieldExist) {
      prevState.push({
        param: param,
        value: value,
        message: msg,
      });
    }

    return prevState;
  });
};

export const getAorAn = (word: string) => {
  if (word.length == 0) return "";
  const lcFirstChar = word.toLowerCase()[0];
  if (['a', 'e', 'i', 'o', 'u'].includes(lcFirstChar)) {
    return "an";
  }
  return "a";
}