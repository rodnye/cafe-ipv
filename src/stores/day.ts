import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Day, DayProductEntry } from '@/types';
import { useProductStore } from './product';

const STORAGE_KEY = 'cafeteria-days';

export const useDayStore = defineStore('days', () => {
  const days = ref<Day[]>([]);
  const currentDayId = ref<string | null>(null);
  const productStore = useProductStore();

  const load = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      days.value = JSON.parse(stored);
    } else {
      createDayFromPrevious(null);
    }
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(days.value));
  };

  const createDayFromPrevious = (previousDayId: string | null) => {
    const today = new Date().toISOString().split('T')[0]!;
    if (days.value.some((d) => d.date === today)) {
      const existing = days.value.find((d) => d.date === today);
      if (existing) currentDayId.value = existing.id;
      return;
    }

    let products: DayProductEntry[] = [];
    if (previousDayId) {
      const prevDay = days.value.find((d) => d.id === previousDayId);
      if (prevDay) {
        products = prevDay.products.map((p) => ({
          ...p,
          inicio: p.final,
          entrada: 0,
          salida: 0,
          vendido: 0,
          importe: 0,
          final: p.final,
        }));
        products.forEach((p) => {
          p.final = p.inicio + p.entrada - p.salida;
          p.importe = p.vendido * p.precio;
        });
      }
    } else {
      products = productStore.products.map((prod) => ({
        productId: prod.id,
        productName: prod.name,
        inicio: 0,
        entrada: 0,
        salida: 0,
        total: 0,
        precio: prod.price,
        vendido: 0,
        importe: 0,
        final: 0,
      }));
    }

    const newDay: Day = {
      id: crypto.randomUUID(),
      date: today,
      products,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    days.value.push(newDay);
    currentDayId.value = newDay.id;
    save();
  };

  const setCurrentDay = (dayId: string) => {
    currentDayId.value = dayId;
  };

  const currentDay = computed(() => {
    return days.value.find((d) => d.id === currentDayId.value) || null;
  });

  const syncWithOrders = (
    dayId: string,
    orders: { items: { productId: string; quantity: number }[] }[]
  ) => {
    const day = days.value.find((d) => d.id === dayId);
    if (!day) return;

    // Agregar cantidades por producto
    const quantities = new Map<string, number>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const current = quantities.get(item.productId) || 0;
        quantities.set(item.productId, current + item.quantity);
      });
    });

    day.products.forEach((entry) => {
      const qty = quantities.get(entry.productId) || 0;
      entry.vendido = qty;
      entry.importe = qty * entry.precio;
      entry.total = entry.inicio + entry.entrada - entry.salida;
      entry.final = entry.total - entry.vendido;
    });

    day.updatedAt = Date.now();
    save();
  };

  const addProductToDay = (
    dayId: string,
    productId: string,
    productName: string,
    defaultPrice: number
  ) => {
    const day = days.value.find((d) => d.id === dayId);
    if (!day) return;
    if (day.products.some((p) => p.productId === productId)) return;
    const newEntry: DayProductEntry = {
      productId,
      productName,
      inicio: 0,
      entrada: 0,
      salida: 0,
      total: 0,
      precio: defaultPrice,
      vendido: 0,
      importe: 0,
      final: 0,
    };
    day.products.push(newEntry);
    day.updatedAt = Date.now();
    save();
  };

  const updateDayEntry = (
    dayId: string,
    productId: string,
    field: keyof DayProductEntry,
    value: number
  ) => {
    const day = days.value.find((d) => d.id === dayId);
    if (!day) return;
    const entry = day.products.find((p) => p.productId === productId);
    if (!entry) return;
    if (
      field === 'inicio' ||
      field === 'entrada' ||
      field === 'salida' ||
      field === 'precio'
    ) {
      entry[field] = value;
      if (field === 'precio') {
        entry.importe = entry.vendido * entry.precio;
      }
      entry.total = entry.inicio + entry.entrada - entry.salida;
      entry.final = entry.total - entry.vendido;
      day.updatedAt = Date.now();
      save();
    }
  };

  return {
    days,
    currentDayId,
    currentDay,
    load,
    createDayFromPrevious,
    setCurrentDay,
    syncWithOrders,
    addProductToDay,
    updateDayEntry,
  };
});
