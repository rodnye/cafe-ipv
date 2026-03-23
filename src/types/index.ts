export type IProductId = string & { readonly __brand: unique symbol };

export type IMutableProductDailyField = keyof Pick<
  IProductDailyData,
  'inicio' | 'entrada' | 'salida'
>;

export interface IProductDailyData {
  inicio: number;
  entrada: number;
  salida: number;
  total: number;
  vendido: number;
  importe: number;
  final: number;
}

export interface IProduct {
  id: IProductId;
  name: string;
  price: number;
  daily: IProductDailyData;
}

export interface IOrderItem {
  productId: IProductId;
  quantity: number;
}

export type IOrderId = string & { readonly __brand: unique symbol };
export interface IOrder {
  id: IOrderId;
  items: IOrderItem[];
  createdAt: number;
  updatedAt: number;
}

export type IDayId = string & { readonly __brand: unique symbol };
export interface IDay {
  id: IDayId;
  date: string;
  products: IProduct[];
  orders: IOrder[];
  createdAt: number;
  updatedAt: number;
}

export interface ICartItem {
  productId: IProductId;
  name: string;
  price: number;
  quantity: number;
}

export interface ICard {
  id: string;
  alias: string;
  cardNumber: string;
  phoneNumber: string;
  createdAt: number;
}
