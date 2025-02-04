import { ConfigurationModel } from "./models/configurations";

export interface AssetTypeListItemModel {
  id?: string;
  name?: string;
  code?: string;
  description?: string;
}

export interface AssetSubTypeListItemModel {
  id?: string;
  name?: string;
  code?: string;
  description?: string;
  assetTypeId?: string;
  assetTypeDetails?: AssetTypeListItemModel;
  createdAt?: string;
  modifiedAt?: string;
  createdBy?: string;
  modifiedBy?: string;
  isActive?: string;
}

export interface AssetModelListItemModel {
  id?: string;
  modelName?: string;
  modelNumber?: string;
  modelDescription?: string;
  assetModelParentAssetTypeDetails?: AssetTypeListItemModel;
}

export interface AssetInUseCustomerDetailsModel {
  orgName?: string;
  branchName?: string;
  firstName?: string;
  lastName?: string;
}

export interface AssetInUseListItemModel {
  id?: string;
  serialNo?: string;
  assetMasterDetails?: AssetMasterListItemModel;
  statusDetails?: ConfigurationModel;
  customerDetails?: AssetInUseCustomerDetailsModel;
  createdAt?: string;
}

export interface AssetMasterListItemModel {
  id?: string;
  serialNo?: string;
  asWarranty?: boolean;
  purchaseId?: string;
  oemWarrantyDate?: string;
  extendedWarrantyDate?: string;
  uniqueIdentifier?: string;
  assetTypeDetails?: AssetTypeListItemModel;
  assetModelDetails?: AssetModelListItemModel;
  impactDetails?: ConfigurationModel;
  assetStatusDetails?: ConfigurationModel;
  uniqueIdentifierTypeDetails?: ConfigurationModel;
  licensedTypeDetails?: ConfigurationModel;
}

export interface IssueTypeListItemModel {
  id?: string;
  name?: string;
  code?: string;
  description?: string;
}
