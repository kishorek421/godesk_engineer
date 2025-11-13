import { FlatList, View, Text, Image, RefreshControl } from "react-native";
import React, { useEffect, useState } from "react";
import api from "@/clients/apiClient";
import {
  GET_LEAVE_REQUEST_LIST,
  GET_USER_DETAILS,

} from "@/constants/api_endpoints";
import { LeaveRequestModel } from "@/models/leave";
import useRefresh from "@/hooks/useRefresh";
import { Button, ButtonText } from "@/components/ui/button";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import Icon from "@expo/vector-icons/AntDesign";
import LeaveCustomerEmployeeListItemLayout from "@/components/leave/LeaveCustomerEmployeeListItemLayout";
import { UserDetailsModel } from "@/models/users";
import { RoleModel } from "@/models/rbac";
import { use } from "i18next";
import PrimaryText from "@/components/PrimaryText";
import BasePage from "@/components/base/base_page";
import LoadingBar from "@/components/LoadingBar";

const LeaveRequestList = () => {
  const { userId } = useLocalSearchParams();

  const [leaveRequestList, setLeaveRequestList] = useState<LeaveRequestModel[]>(
    []
  );
  const [refreshing, setRefreshing] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetailsModel>({});
  const { refreshFlag, setRefreshFlag } = useRefresh();

  useEffect(() => {
    fetchMyLeaveList(1);
    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (refreshFlag) {
      fetchMyLeaveList(1);
    }
  }, [refreshFlag]);

  const fetchMyLeaveList = (nextPageNumber: number) => {
    api
      .get(GET_LEAVE_REQUEST_LIST, {
        params: {
          pageNo: nextPageNumber,
          pageSize: 10,
        },
      })
      .then((response) => {
        setRefreshing(false);
        setIsLoading(false);
        let content = response.data?.data?.content ?? [];
        if (nextPageNumber === 1) {
          setLeaveRequestList(content);
        } else {
          setLeaveRequestList((prevState) => [...prevState, ...content]);
        }
        console.log("->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", content);

        let paginator = response.data?.data?.paginator;
        if (paginator) {
          let iCurrentPage = paginator.currentPage;
          let iLastPage = paginator.lastPage;
          if (iCurrentPage && iLastPage !== undefined) {
            setCurrentPage(iCurrentPage);
            setIsLastPage(iLastPage);
          }
        }
        setRefreshFlag(false);
      })
      .catch((e) => {
        console.error(e);
        setRefreshing(false);
        setIsLoading(false);
      });
  };
  const fetchUserDetails = () => {
    api
      .get(GET_USER_DETAILS)
      .then((response) => {
        console.log("userTypeDetails---->", response);
        setUserDetails(response.data.data ?? {});
      })
      .catch((e) => {
        console.error(e);
      });
  };
  return (
    <BasePage>
      <View>
        {userDetails.roleDetails?.length &&
          !userDetails.roleDetails.some(
            (role) => role.code === "CUSTOMER" || role.code === "ADMIN"
          ) && (
            <View>
              <Button
                className="bg-primary-950 mx-4 mt-4"
                onPress={() =>
                  router.push({
                    pathname: "/leave/create_leave_request/[leaveId]",
                    params: {
                      leaveId: "create",
                    },
                  })
                }
              >
                <ButtonText>Apply Leave</ButtonText>
                <Icon
                  name="arrowright"
                  color="white"
                  size={22}
                  className="ms-2"
                />
              </Button>
              {/* {/* <Text stringify(roleDetails.roleDetails?.code)}</Text> */}
            </View>
          )}
        {isLoading ? (
          <LoadingBar />
        ) : leaveRequestList.length === 0 ? (
          <BasePage>
            <View
                    className={` bg-gray-200 flex justify-center items-center rounded-lg h-36 mb-4 mt-6 mx-4`}
                  >
                    <Text className="text-gray-500 text-sm text-center font-regular">
                      No Data Found
                    </Text>
                  </View>
          </BasePage>
        ) : (
          <View className="pt-2 bg-gray-100 h-full">
            <FlatList
              data={leaveRequestList}
              renderItem={({ item }) => (
                <LeaveCustomerEmployeeListItemLayout
                  data={item}
                  userId={userDetails?.id ?? ""}
                  roleCode={
                    userDetails?.roleDetails?.find(
                      (role) => role.code !== "B2C_USER"
                    )?.code ?? ""
                  }
                />
              )}
              keyExtractor={(_, index) => index.toString()}
              onEndReached={() => {
                if (!isLastPage) {
                  fetchMyLeaveList(currentPage + 1);
                }
              }}
              ListFooterComponent={<View style={{ height: 200 }} />}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    fetchMyLeaveList(1);
                  }}
                />
              }
            />
          </View>
        )}
      </View>
    </BasePage>
  );
};

export default LeaveRequestList;
