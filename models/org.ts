import { ConfigurationModel } from "./configurations";
import {
  CountryListItemModel,
  CityListItemModel,
  StateListItemModel,
  PincodeListItemModel,
  AreaListItemModel,
} from "./geolocations";

export interface OrgDetailsModel {
  id?: string;
  name?: string;
  description?: string;
  partnerType?: string;
  contactPersonId?: string;
  headOfficeId?: string;
  email?: string;
  mobile?: string;
  alternateNumber?: string;
  categoryOfOrgDetails?: ConfigurationModel;
  sizeOfOrgDetails?: ConfigurationModel;
  typeOfOrgDetails?: ConfigurationModel;
  address?: string;
  countryDetails?: CountryListItemModel;
  cityDetails?: CityListItemModel;
  stateDetails?: StateListItemModel;
  pincodeDetails?: PincodeListItemModel;
  areaDetails?: AreaListItemModel;
  createdAt?: string;
  createdBy?: string;
}

export interface OrgDesignationMappingDetailsModel {
  id?: string;
  name?: string;
  code?: string;
  levelId?: string;
}

export interface OrgDepartmentMappingDetailsModel {
  id?: string;
  name?: string;
  code?: string;
}

export interface BranchDetailsModel {
  id?: string;
  name?: string;
  orgId?: string;
  headOfBranchId?: string;
  gstin?: string;
  msmeNo?: string;
  email?: string;
  mobile?: string;
  address?: string;
  countryId?: string;
  cityId?: string;
  stateId?: string;
  pincodeId?: string;
  areaId?: string;
  branchPic?: string;
  createdAt?: string;
  createdBy?: string;
}

