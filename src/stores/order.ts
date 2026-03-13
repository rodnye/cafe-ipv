import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Order, OrderItem } from '@/types';

const STORAGE_KEY = 'cafeteria-orders';

export const useOrderStore = defineStore('orders', () => {
  const orders = ref<Order[]>([]);

  const load = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      orders.value = JSON.parse(stored);
    } else {
      orders.value = [];
    }
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.value));
  };

  const getOrdersByDay = (dayId: string): Order[] => {
    return orders.value.filter((o) => o.dayId === dayId);
  };

  const createOrder = (dayId: string, items: OrderItem[]) => {
    const newOrder: Order = {
      id: crypto.randomUUID(),
      dayId,
      items: items.map((item) => ({
        ...item,
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    orders.value.splice(0, 0, newOrder);
    save();
    return newOrder;
  };

  const updateOrder = (orderId: string, items: OrderItem[]) => {
    const index = orders.value.findIndex((o) => o.id === orderId);
    if (index !== -1) {
      orders.value[index] = {
        ...orders.value[index]!,
        items: items.map((item) => ({
          ...item,
        })),
        updatedAt: Date.now(),
      };
      save();
    }
  };

  const deleteOrder = (orderId: string) => {
    orders.value = orders.value.filter((o) => o.id !== orderId);
    save();
  };

  return {
    orders,
    load,
    save,
    getOrdersByDay,
    createOrder,
    updateOrder,
    deleteOrder,
  };
});
