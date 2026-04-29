export interface User {
  id: string;
  name: string;
  username: string;
  fullname: string;
  email: string;
  role: 'admin' | 'user' | string;
  status: 'active' | 'inactive' | string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export interface Company {
  _id: string;
  name: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
}

export interface Lease {
  _id: string;
  name: string;
  company: string;
}

export interface Well {
  _id: string;
  name: string;
  gps?: string;
  description?: string;
  lease: string;
  company: string;
}

export interface Warehouse {
  _id: string;
  name: string;
  warehousenumber: string;
  areamanager?: string;
}

export interface Chemical {
  _id: string;
  tradename: string;
  dottag?: string;
  weight?: number;
}

export interface WarehouseChemical {
  _id: string;
  warehouse: string;
  chemical: string | Chemical;
  quantity: number;
}

export interface ShippingPaper {
  _id: string;
  datanumber: string;
  createdBy: string;
  originwarehousenumber: string;
  destinationwarehousenumber: string;
  trucknumber?: string;
  gps?: string;
  comments?: string;
  date: string;
  active: 0 | 1;
}

export interface ShippingChemical {
  _id: string;
  shippingPaper: string;
  chemical: string | Chemical;
  quantity: number;
}

export interface Delivery {
  _id: string;
  datanumber: string;
  company: string;
  lease: string;
  well: string;
  createdBy: string;
  invoicenum?: string;
  gps?: string;
  comments?: string;
  date: string;
  active: 0 | 1;
}

export interface DeliveryChemical {
  _id: string;
  delivery: string;
  chemical: string | Chemical;
  quantity: number;
}
