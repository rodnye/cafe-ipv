import { defineStore } from 'pinia';
import { useDayStore } from './day';
import type { IDayId, IMutableProductDailyField } from '@/types';
import { useProductStore } from './product';

export const useTableStore = defineStore('table', () => {
  const dayStore = useDayStore();
  const productStore = useProductStore();

  const calculateTotals = async (dayId: IDayId) => {
    const day = await dayStore.getDay(dayId);

    for (const product of day.products) {
      product.daily.total =
        product.daily.inicio + product.daily.entrada - product.daily.salida;
      product.daily.final = product.daily.total - product.daily.vendido;
      product.daily.importe = product.daily.vendido * product.price;
    }

    day.updatedAt = Date.now();
    await dayStore.saveDay(day);
  };

  const syncWithOrders = async (dayId: IDayId) => {
    const day = await dayStore.getDay(dayId);

    day.products.forEach((p) => {
      p.daily.vendido = 0;
      p.daily.importe = 0;
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
      product.daily.vendido = qty;
      product.daily.importe = qty * product.price;
      product.daily.total =
        product.daily.inicio + product.daily.entrada - product.daily.salida;
      product.daily.final = product.daily.total - product.daily.vendido;
    });

    day.updatedAt = Date.now();
    await dayStore.saveDay(day);
  };

  const updateField = async (
    dayId: IDayId,
    productId: string,
    field: IMutableProductDailyField | 'price',
    value: number
  ) => {
    const day = await dayStore.getDay(dayId);

    const product = day.products.find((p) => p.id === productId);
    if (!product) return;

    if (field === 'price') {
      await productStore.updateProduct(dayId, productId, { price: value });
    } else {
      product.daily[field] = value;
    }

    product.daily.total =
      product.daily.inicio + product.daily.entrada - product.daily.salida;
    product.daily.final = product.daily.total - product.daily.vendido;

    day.updatedAt = Date.now();
    await dayStore.saveDay(day);
  };

  return {
    calculateTotals,
    syncWithOrders,
    updateField,
  };
});
