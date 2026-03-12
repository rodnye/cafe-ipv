import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Product } from '@/types';

const STORAGE_KEY = 'cafeteria-products';

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>([]);

  const load = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      products.value = JSON.parse(stored);
    } else {
      products.value = [
        {
          id: crypto.randomUUID(),
          name: 'Fanguito',
          price: 600,
          createdAt: Date.now(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Refresco Lata',
          price: 250,
          createdAt: Date.now(),
        },
        {
          id: crypto.randomUUID(),
          name: 'HUpman c/filtro',
          price: 450,
          createdAt: Date.now(),
        },
        {
          id: crypto.randomUUID(),
          name: 'HUpman s/filtro',
          price: 400,
          createdAt: Date.now(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Cigarro Criollo',
          price: 300,
          createdAt: Date.now(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Condones',
          price: 50,
          createdAt: Date.now(),
        },
        {
          id: crypto.randomUUID(),
          name: 'BlackOut',
          price: 160,
          createdAt: Date.now(),
        },
        {
          id: crypto.randomUUID(),
          name: 'Doble Deleite',
          price: 120,
          createdAt: Date.now(),
        },
      ];
      save();
    }
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products.value));
  };

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    products.value.push(newProduct);
    save();
  };

  const updateProduct = (
    id: string,
    data: Partial<Omit<Product, 'id' | 'createdAt'>>
  ) => {
    const index = products.value.findIndex((p) => p.id === id);
    if (index !== -1) {
      products.value[index] = { ...products.value[index]!, ...data };
      save();
    }
  };

  const deleteProduct = (id: string) => {
    products.value = products.value.filter((p) => p.id !== id);
    save();
  };

  return { products, load, addProduct, updateProduct, deleteProduct };
});
