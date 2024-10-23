export interface PaginatorModel {
  currentPage?: number;
  perPageItemCount?: number;
  currentPageItemCount?: number;
  totalItems?: number;
  totalPages?: number;
  lastPage?: boolean;
}

export interface DropdownModel {
  label?: string;
  value?: string;
}

export interface ErrorModel {
  value?: string;
  message?: string;
  param?: string;
}

export interface ApiResponseModel<T> {
  data?: T;
  success?: boolean;
  status?: string;
  message?: string;
  errors?: ErrorModel;
}

export interface PaginatedData<T> {
  content: T,
  pagination: PaginatorModel
}
