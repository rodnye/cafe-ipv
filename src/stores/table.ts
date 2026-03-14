import { defineStore } from 'pinia';
import { useDayStore } from './day';
import type { IDayId, IProduct } from '@/types';
import { useProductStore } from './product';

export const useTableStore = defineStore('table', () => {
  const dayStore = useDayStore();
  const productStore = useProductStore();

  const calculateTotals = async (dayId: IDayId) => {
    const day = await dayStore.getDay(dayId);

    for (const product of day.products) {
      product.total = product.inicio + product.entrada - product.salida;
      product.final = product.total - product.vendido;
      product.importe = product.vendido * product.price;
    }

    day.updatedAt = Date.now();
    await dayStore.saveDay(day);
  };

  const syncWithOrders = async (dayId: IDayId) => {
    const day = await dayStore.getDay(dayId);

    day.products.forEach((p) => {
      p.vendido = 0;
      p.importe = 0;
    });

    const quantities = new Map<string, number>();
    day.orders.forEach((order) => {
      order.items.forEach((item) => {
        const current = quantities.get(item.productId) || 0;
        quantities.set(item.productId, current + item.quantity);
      });
    });

    day.products.forEach((product) => {
      const qty = quantities.get(product.id) || 0;
      product.vendido = qty;
      product.importe = qty * product.price;
      product.total = product.inicio + product.entrada - product.salida;
      product.final = product.total - product.vendido;
    });

    day.updatedAt = Date.now();
    await dayStore.saveDay(day);
  };

  const updateField = async (
    dayId: IDayId,
    productId: string,
    field: keyof Pick<IProduct, 'inicio' | 'entrada' | 'salida' | 'price'>,
    value: number
  ) => {
    const day = await dayStore.getDay(dayId);

    const product = day.products.find((p) => p.id === productId);
    if (!product) return;

    if (field === 'price') {
      await productStore.updateProduct(dayId, productId, { price: value });
    } else product[field] = value;

    product.total = product.inicio + product.entrada - product.salida;
    product.final = product.total - product.vendido;

    day.updatedAt = Date.now();
    await dayStore.saveDay(day);
  };

  return {
    calculateTotals,
    syncWithOrders,
    updateField,
  };
});
