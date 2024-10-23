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
