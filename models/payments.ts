import {
    AssetModelListItemModel,
    AssetSubTypeListItemModel,
    AssetTypeListItemModel,
  } from "./assets";
  import { ConfigurationModel } from "./configurations";
  
  export interface OrderProductsForTicketModel {
    id?: string;
    ticketId?: string;
    itemDetails?: ItemDetailsModel;
    quantity?: number;
    discount?: string;
    finalPrice?: string;
  }
  
  export interface ItemDetailsModel {
    inventoryId?: string;
    productTypeDetails?: ConfigurationModel;
    productDetails?: ProductDetailsModel;
    actualPrice?: string;
    gstPercentage?: string;
  }
  
  export interface ProductDetailsModel {
    assetTypeDetails?: AssetTypeListItemModel;
    assetModelDetails?: AssetModelListItemModel;
    assetSubTypeDetails?: AssetSubTypeListItemModel;
    assetSubTypeModelDetails?:AssetSubTypeListItemModel;
  }
  
  export interface RazorPayOrderForTicket {
    id?: string;
    orderId?: string;
    orderStatus?: string;
    amountDue?: string;
    processingFee?: string;
    amountToPay?: string;
    amountPaid?: string;
  }