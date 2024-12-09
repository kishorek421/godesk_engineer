export interface AreaListItemModel {
  id?: string;
  cityId?: string;
  cityName?: string;
  cityCode?: string;
  stateId?: string;
  stateName?: string;
  stateCode?: string;
  countryId?: string;
  countryName?: string;
  countryCode?: string;
  areaName?: string;
  pincodeId?: string;
  pincode?: string;
}

export interface CityListItemModel {
  id?: string;
  cityName?: string;
  cityCode?: string;
  stateId?: string;
  stateName?: string;
  stateCode?: string;
  countryId?: string;
  countryName?: string;
  countryCode?: string;
}

export interface CountryListItemModel {
  id?: string;
  countryName?: string;
  countryCode?: string;
  phoneCode?: string;
}

export interface PincodeListItemModel {
  id?: string;
  cityId?: string;
  cityName?: string;
  cityCode?: string;
  stateId?: string;
  stateName?: string;
  stateCode?: string;
  countryId?: string;
  countryName?: string;
  countryCode?: string;
  pincode?: string;
}

export interface StateListItemModel {
  id?: string;
  stateName?: string;
  stateCode?: string;
  countryId?: string;
  countryName?: string;
  countryCode?: string;
}
