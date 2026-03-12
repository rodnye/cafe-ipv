export interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: number;
}

export interface DayProductEntry {
  productId: string;
  productName: string;
  inicio: number;
  entrada: number;
  salida: number;
  precio: number;
  vendido: number;
  importe: number;
  final: number;
}

export interface Day {
  id: string;
  date: string;
  products: DayProductEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}
