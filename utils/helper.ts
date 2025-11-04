import { ESCALATED, RAISED, TICKET_IN_PROGRESS, TICKET_CLOSED, ASSIGNED } from "@/constants/configuration_keys";
import { AUTH_TOKEN_KEY } from "@/constants/storage_keys";
import { ErrorModel } from "@/models/common";
import { router } from "expo-router";
import moment from "moment";
import { getItem } from "./secure_store";
import axios from "axios";
import qs from "qs";
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
    case ASSIGNED:
      return "text-[#040042] bg-[#d2cfff]";
    default:
      return "bg-color-white color-gray-900";
  }
};

export function getGreetingMessage() {
  const currentHour = moment().hour();

  if (currentHour >= 5 && currentHour < 12) {
    return ('goodMorning');
  } else if (currentHour >= 12 && currentHour < 17) {
    return ('goodAfternoon');
  } else if (currentHour >= 17 && currentHour < 21) {
    return ('goodEvening');
  } else {
    return ('hello');
  }
}
export const getAorAn = (word: string) => {
  if (word.length == 0) return "";
  const lcFirstChar = word.toLowerCase()[0];
  if (["a", "e", "i", "o", "u"].includes(lcFirstChar)) {
    return "an";
  }
  return "a";
};
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

// http://my.exotel.com/bellwether2/exoml/start_voice/916046
export const makeExotelCall = async (
  mobile: string,
  userId: string,
  showToast: (options: {
    position: "top" | "bottom";
    type: "success" | "error" | "info";
    message: string;
  }) => void
) => {
  const token = await getItem(AUTH_TOKEN_KEY);
  if (!token) return;
  try {
    console.log("token", token);

    let data = qs.stringify(
      {
        From: userId,
        CallerId: "08047096559",
        To: mobile,
      },
      { encode: false }
    );
    console.log("data", data);


    const authToken = btoa(
      `2c5dd739f347675fbf942814e5bb5c57697c023fcf43966d:34464c9d277b68db16029237a7748fc3501cdcf84b25655f`
    );

    console.log("authToken", authToken);
    // MmM1ZGQ3MzlmMzQ3Njc1ZmJmOTQyODE0ZTViYjVjNTc2OTdjMDIzZmNmNDM5NjZkOjM0NDY0YzlkMjc3YjY4ZGIxNjAyOTIzN2E3NzQ4ZmMzNTAxY2RjZjg0YjI1NjU1Zg==

    const response = await axios.post(
      "https://api.exotel.com/v1/Accounts/bellwether2/Calls/connect",
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${authToken}`,
          Accept: "*/*",
        },
      }
    );
    console.log("Call initiated:", response.data);
    console.log("Call initiated:", response.status);

    if (response.status === 200) {
      showToast({
        position: "top",
        type: "success",
        message: "callRequestedSuccessfully",
      });
    } else {
      showToast({
        position: "top",
        type: "error",
        message: "failedToRequestACallBack",
      });
    }
  } catch (error) {
    console.error(
      "Error initiating call:",
      error?.response ? error.response.data : error.message
    );
    showToast({
      position: "top",
      type: "error",
      message: "failedToRequestACallBack",
    });
  } finally {
    setIsLoading(false);
  }
};

export function generateLogo(firstname: string, lastname?: string): string {
  const logName = lastname
    ? `${firstname.substring(0, 1)}${lastname.substring(0, 1)}`
    : `${firstname.slice(0, 2)}`;
  return logName.toUpperCase();
}
export const handleNotificationNavigation = (remoteMessage: any, from = "") => {
  console.log("remoteMessage", remoteMessage);
  const data = remoteMessage.data;
  console.log("Local notification tapped:", data);
  // redirectToPage(navigation, { data });
  const type = data?.type;
  const id = data?.id;
  if (type === "TICKET" && id) {
    router.push({
      pathname: "/ticket_details/[ticketId]",
      params: {
        ticketId: id,
      },
    });
  }
  // if (type === "LEAVE_REQUEST" && id) {
  //   router.push({
  //     pathname: "/leave/leave_history/details/[leaveId]",
  //     params: {
  //       leaveId: id,
  //     },
  //   });
  // }
};
export const numerals_en = {
  0: "0", 1: "1", 2: "2", 3: "3", 4: "4",
  5: "5", 6: "6", 7: "7", 8: "8", 9: "9"
};

export const numerals_kn = {
  0: "0", 1: "೧", 2: "೨", 3: "೩", 4: "೪",
  5: "೫", 6: "೬", 7: "೭", 8: "೮", 9: "೯"
};


export const numerals_te = {
  0: "0", 1: "౧", 2: "౨", 3: "౩", 4: "౪",
  5: "౫", 6: "౬", 7: "౭", 8: "౮", 9: "౯"
};


export const numerals_ta = {
  0: "0", 1: "௧", 2: "௨", 3: "௩", 4: "௪",
  5: "௫", 6: "௬", 7: "௭", 8: "௮", 9: "௯"
};
export const numerals_hi = {
  0: "0", 1: "१", 2: "२", 3: "३", 4: "४",
  5: "५", 6: "६", 7: "७", 8: "८", 9: "९"
};
