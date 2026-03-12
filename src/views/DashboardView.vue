<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useProductStore } from '@/stores/product';
  import { useDayStore } from '@/stores/day';
  import { useOrderStore } from '@/stores/order';
  import ProductCard from '@/components/ProductCard.vue';
  import CurrentOrder from '@/components/CurrentOrder.vue';
  import OrderList from '@/components/OrderList.vue';
  import { Button } from '@/components/ui/button';
  import { ChevronDown } from 'lucide-vue-next';

  const productStore = useProductStore();
  const dayStore = useDayStore();
  const orderStore = useOrderStore();

  onMounted(() => {
    productStore.load();
    dayStore.load();
    orderStore.load();
    if (!dayStore.currentDay) {
      dayStore.createDayFromPrevious(null);
    }
    refreshDayFromOrders();
  });

  //paginación de productos
  const limit = ref(8);
  const productsToShow = computed(() =>
    productStore.products.slice(0, limit.value)
  );
  const showMore = () => {
    limit.value += 8;
  };

  const currentOrderItems = ref<{ productId: string; quantity: number }[]>([]);
  const editingOrderId = ref<string | null>(null);

  const addToCurrentOrder = (productId: string) => {
    const existing = currentOrderItems.value.find(
      (item) => item.productId === productId
    );
    if (existing) {
      existing.quantity++;
    } else {
      currentOrderItems.value.push({ productId, quantity: 1 });
    }
  };

  const removeFromCurrentOrder = (productId: string) => {
    const index = currentOrderItems.value.findIndex(
      (item) => item.productId === productId
    );
    if (index !== -1) {
      const item = currentOrderItems.value[index]!;
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        currentOrderItems.value.splice(index, 1);
      }
    }
  };

  const removeItemCompletely = (productId: string) => {
    currentOrderItems.value = currentOrderItems.value.filter(
      (i) => i.productId !== productId
    );
  };

  const clearCurrentOrder = () => {
    currentOrderItems.value = [];
    editingOrderId.value = null;
  };

  //mapa de precios del día actual
  const dayPricesMap = computed(() => {
    const map = new Map<string, number>();
    if (dayStore.currentDay) {
      dayStore.currentDay.products.forEach((p) => {
        map.set(p.productId, p.precio);
      });
    }
    return map;
  });

  // Pedidos del día actual
  const ordersForCurrentDay = computed(() => {
    if (!dayStore.currentDay) return [];
    return orderStore.getOrdersByDay(dayStore.currentDay.id);
  });

  // Cargar pedido para edición
  const editOrder = (orderId: string) => {
    const order = orderStore.orders.find((o) => o.id === orderId);
    if (!order) return;
    currentOrderItems.value = order.items.map((item) => ({ ...item }));
    editingOrderId.value = orderId;
  };

  // Guardar pedid
  const saveOrder = () => {
    if (!dayStore.currentDay) return;
    const items = currentOrderItems.value.filter((item) => item.quantity > 0);
    if (items.length === 0) return;

    if (editingOrderId.value) {
      orderStore.updateOrder(editingOrderId.value, items);
    } else {
      orderStore.createOrder(dayStore.currentDay.id, items);
    }

    refreshDayFromOrders();
    clearCurrentOrder();
  };

  // Eliminar pedido
  const deleteOrder = (orderId: string) => {
    if (!confirm('¿Eliminar este pedido?')) return;
    orderStore.deleteOrder(orderId);
    refreshDayFromOrders();
    if (editingOrderId.value === orderId) {
      clearCurrentOrder();
    }
  };

  const refreshDayFromOrders = () => {
    if (!dayStore.currentDay) return;
    const dayId = dayStore.currentDay.id;
    const orders = orderStore.getOrdersByDay(dayId);

    const productIdsInOrders = new Set<string>();
    orders.forEach((order) => {
      order.items.forEach((item) => productIdsInOrders.add(item.productId));
    });
    productIdsInOrders.forEach((productId) => {
      const exists = dayStore.currentDay!.products.some(
        (p) => p.productId === productId
      );
      if (!exists) {
        const product = productStore.products.find((p) => p.id === productId);
        if (product) {
          dayStore.addProductToDay(
            dayId,
            productId,
            product.name,
            product.price
          );
        }
      }
    });

    // Sincronizar cantidades
    dayStore.syncWithOrders(dayId, orders);
  };

  watch(
    () => dayStore.currentDayId,
    () => {
      clearCurrentOrder();
      refreshDayFromOrders();
    }
  );
</script>

<template>
  <div class="flex flex-col gap-4 lg:flex-row lg:gap-6">
    <div class="flex-1">
      <h2 class="text-primary mb-4 text-xl font-bold md:text-2xl">Productos</h2>
      <div
        class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 xl:grid-cols-4"
      >
        <ProductCard
          v-for="product in productsToShow"
          :key="product.id"
          :product="product"
          @add-to-cart="addToCurrentOrder(product.id)"
        />
        <div
          v-if="productStore.products.length > limit"
          class="col-span-full mt-4 flex justify-center"
        >
          <Button variant="outline" @click="showMore" class="gap-2">
            Ver más <ChevronDown class="size-4" />
          </Button>
        </div>
      </div>
    </div>

    <aside class="space-y-4 lg:w-80">
      <CurrentOrder
        :items="currentOrderItems"
        :products="productStore.products"
        :day-prices="dayPricesMap"
        :is-editing="!!editingOrderId"
        @increment="addToCurrentOrder"
        @decrement="removeFromCurrentOrder"
        @remove="removeItemCompletely"
        @save="saveOrder"
        @cancel="clearCurrentOrder"
      />
      <OrderList
        :orders="ordersForCurrentDay"
        :products="productStore.products"
        :day-prices="dayPricesMap"
        @edit="editOrder"
        @delete="deleteOrder"
      />
    </aside>
  </div>
</template>
