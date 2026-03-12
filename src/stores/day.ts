import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Day, DayProductEntry, CartItem } from '@/types';
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

  const addToCart = (productId: string, quantity: number = 1) => {
    if (!currentDay.value) return;
    const day = currentDay.value;
    const entry = day.products.find((p) => p.productId === productId);
    if (!entry) {
      const product = productStore.products.find((p) => p.id === productId);
      if (!product) return;
      const newEntry: DayProductEntry = {
        productId,
        productName: product.name,
        inicio: 0,
        entrada: 0,
        salida: quantity,
        precio: product.price,
        vendido: quantity,
        importe: quantity * product.price,
        final: 0 - quantity,
      };
      day.products.push(newEntry);
    } else {
      entry.salida += quantity;
      entry.vendido += quantity;
      entry.importe = entry.vendido * entry.precio;
      entry.final = entry.inicio + entry.entrada - entry.salida;
    }
    day.updatedAt = Date.now();
    save();
  };

  const cartItems = computed<CartItem[]>(() => {
    if (!currentDay.value) return [];
    return currentDay.value.products
      .filter((p) => p.vendido > 0)
      .map((p) => ({
        productId: p.productId,
        name: p.productName,
        price: p.precio,
        quantity: p.vendido,
      }));
  });

  const totalImporte = computed(() => {
    return cartItems.value.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  });

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
      field === 'vendido' ||
      field === 'precio'
    ) {
      (entry[field] as number) = value;
      if (field === 'vendido' || field === 'precio') {
        entry.importe = entry.vendido * entry.precio;
      }
      entry.final = entry.inicio + entry.entrada - entry.salida;
      day.updatedAt = Date.now();
      save();
    }
  };

  return {
    days,
    currentDayId,
    currentDay,
    cartItems,
    totalImporte,
    load,
    createDayFromPrevious,
    setCurrentDay,
    addToCart,
    updateDayEntry,
  };
});
