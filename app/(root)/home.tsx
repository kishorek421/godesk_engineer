import { View } from "react-native";
import { VStack } from "@/components/ui/vstack";
import ContentLayout from "@/components/home/ContentLayout";
import React, { useEffect, useState } from "react";
import api from "@/clients/apiClient";
import {
  GET_LOGINED_USER_MODULES,
  GET_USER_DETAILS,
} from "@/constants/api_endpoints";
import { RoleModel, RoleModulePermissionsModel } from "@/models/rbac";
import { UserDetailsModel } from "@/models/users";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import useAuth from "@/hooks/useAuth";
//import { useToast } from "@/contexts/ToastContext";";

const HomeScreen = () => {
  const [customerDetails, setCustomerDetails] = useState<UserDetailsModel>({});
  const [authorizedModules, setAuthorizedModules] = useState<
    RoleModulePermissionsModel[]
  >([]);

  const [roleDetails, setRoleDetails] = useState<RoleModel>({});
//const {showToast} = useToast();
  useEffect(() => {
    api
      .get(GET_USER_DETAILS, {})
      .then((response) => {
        // console.log(
        //   "Line: 28 - customerDetails ---------------------------~~~~~~~~~~~>",
        //   JSON.stringify(response.data)
        // );
        setCustomerDetails(response.data?.data ?? {});
      })
      .catch((e) => {
        console.error(e);
      });
    api
      .get(GET_LOGINED_USER_MODULES, {})
      .then((response) => {
        // console.log(
        //   "logined user modules---------------------",
        //   response.data?.data?.role
        // );
        const modulesAsTree = response.data?.data?.modules;
        if (modulesAsTree) {
          setAuthorizedModules(convertTreeToFlat(modulesAsTree));
        }
        const userRoleDetails = response.data?.data?.role ?? [];
        if (userRoleDetails.length > 0) {
          setRoleDetails(userRoleDetails[0]);
        }
      })
      .catch((e) => {
        console.error(e);
      });

  
  }, []);

  const convertTreeToFlat = (
    modules: RoleModulePermissionsModel[]
  ): RoleModulePermissionsModel[] => {
    let modulesAsFlat: RoleModulePermissionsModel[] = [];
    for (let module of modules) {
      const subModules = module.subModules ?? [];
      if (subModules.length > 0) {
        const subModulesFlat = convertTreeToFlat(subModules);
        modulesAsFlat.push(...subModulesFlat);
      } else {
        modulesAsFlat.push(module);
      }
    }
    return modulesAsFlat;
  };

  return (
    <View className="pb-2">
      <ContentLayout
        customerDetails={customerDetails}
        roleDetails={roleDetails}
        authorizedModules={authorizedModules}
      />
    </View>
  );
};

export default HomeScreen;
