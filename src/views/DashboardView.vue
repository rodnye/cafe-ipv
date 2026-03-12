<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useProductStore } from '@/stores/product';
  import { useDayStore } from '@/stores/day';
  import { useOrderStore } from '@/stores/order';
  import CurrentOrder from '@/components/CurrentOrder.vue';
  import OrderList from '@/components/OrderList.vue';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Eye, Plus, CheckCheck, Minus, ShoppingBag } from 'lucide-vue-next';
  import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
  } from '@/components/ui/sheet';

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

  // Mobile sheet states
  const showOrdersSheet = ref(false);
  const showProductSheet = ref(false);

  // Search
  const searchQuery = ref('');

  const filteredProducts = computed(() => {
    if (!searchQuery.value) return productStore.products;
    const q = searchQuery.value.toLowerCase();
    return productStore.products.filter((p) =>
      p.name.toLowerCase().includes(q)
    );
  });

  // Current order
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

  // Day prices map
  const dayPricesMap = computed(() => {
    const map = new Map<string, number>();
    if (dayStore.currentDay) {
      dayStore.currentDay.products.forEach((p) => {
        map.set(p.productId, p.precio);
      });
    }
    return map;
  });

  // Orders for current day
  const ordersForCurrentDay = computed(() => {
    if (!dayStore.currentDay) return [];
    return orderStore.getOrdersByDay(dayStore.currentDay.id);
  });

  const currentOrderTotal = computed(() => {
    let total = 0;
    currentOrderItems.value.forEach((item) => {
      const price = dayPricesMap.value.get(item.productId) || 0;
      total += price * item.quantity;
    });
    return total;
  });

  const currentItemCount = computed(() => {
    return currentOrderItems.value.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  });

  // Edit order
  const editOrder = (orderId: string) => {
    const order = orderStore.orders.find((o) => o.id === orderId);
    if (!order) return;
    currentOrderItems.value = order.items.map((item) => ({ ...item }));
    editingOrderId.value = orderId;
    showOrdersSheet.value = false;
  };

  // Save order
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
    showProductSheet.value = false;
  };

  // Delete order
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

    dayStore.syncWithOrders(dayId, orders);
  };

  watch(
    () => dayStore.currentDayId,
    () => {
      clearCurrentOrder();
      refreshDayFromOrders();
    }
  );

  const resetSearch = () => {
    searchQuery.value = '';
  };
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Desktop Layout (hidden on mobile) -->
    <div class="hidden lg:grid lg:h-full lg:grid-cols-3 lg:gap-6">
      <!-- Left column - Products -->
      <div class="col-span-2 overflow-y-auto pr-2">
        <div class="bg-background sticky top-0 z-10 pt-4 pb-2">
          <h2 class="mb-2 text-lg font-semibold">Productos</h2>
          <Input
            v-model="searchQuery"
            placeholder="Buscar productos..."
            class="w-full"
          />
        </div>
        <div class="grid grid-cols-2 gap-3 pb-4">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="bg-card rounded-lg border p-3 transition-shadow hover:shadow-md"
          >
            <div class="mb-2">
              <p class="font-medium">{{ product.name }}</p>
              <p class="text-muted-foreground text-sm">
                {{ product.price }} CUP
              </p>
            </div>
            <Button
              class="w-full gap-1"
              size="sm"
              variant="outline"
              @click="addToCurrentOrder(product.id)"
            >
              <Plus class="size-4" />
              Agregar
            </Button>
          </div>
          <div
            v-if="filteredProducts.length === 0"
            class="text-muted-foreground col-span-2 py-8 text-center"
          >
            No hay productos
          </div>
        </div>
      </div>

      <!-- Right column - Order & Orders -->
      <div class="overflow-y-auto border-l pl-2">
        <div class="bg-background sticky top-0 z-10 pt-4 pb-2">
          <h2 class="mb-2 text-lg font-semibold">Pedido actual</h2>
        </div>
        <div class="space-y-4">
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

          <div class="border-t pt-4">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="font-medium">Pedidos del día</h3>
              <span class="text-muted-foreground text-sm">
                {{ ordersForCurrentDay.length }} pedidos
              </span>
            </div>
            <OrderList
              :orders="ordersForCurrentDay"
              :products="productStore.products"
              :day-prices="dayPricesMap"
              @edit="editOrder"
              @delete="deleteOrder"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Layout (hidden on desktop) -->
    <div class="flex h-full flex-col lg:hidden">
      <!-- Current order summary (sticky top) -->
      <div class="bg-background sticky top-0 z-10 border-b p-3">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-semibold">Pedido actual</h2>
            <p class="text-muted-foreground text-sm">
              {{ currentItemCount }} artículos · {{ currentOrderTotal }} CUP
            </p>
          </div>
          <div class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              class="gap-1"
              @click="showOrdersSheet = true"
            >
              <Eye class="size-4" />
              Pedidos
            </Button>
            <Button size="sm" class="gap-1" @click="showProductSheet = true">
              <Plus class="size-4" />
              Agregar
            </Button>
          </div>
        </div>
      </div>

      <!-- Current order details (scrollable) -->
      <div class="flex-1 overflow-y-auto p-3">
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
      </div>
    </div>

    <!-- Mobile Product Sheet -->
    <Sheet v-model:open="showProductSheet">
      <SheetContent side="bottom" class="h-[90vh] rounded-t-xl p-0">
        <SheetHeader class="border-b p-4">
          <SheetTitle>Agregar productos</SheetTitle>
          <SheetDescription>
            Selecciona los productos para tu pedido
          </SheetDescription>
        </SheetHeader>
        <div class="flex h-full flex-col">
          <div class="border-b p-4">
            <Input
              v-model="searchQuery"
              placeholder="Buscar productos..."
              class="w-full"
            />
          </div>
          <div class="flex-1 overflow-y-auto p-4">
            <div class="space-y-2">
              <div
                v-for="product in filteredProducts"
                :key="product.id"
                class="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p class="font-medium">{{ product.name }}</p>
                  <p class="text-muted-foreground text-sm">
                    {{ product.price }} CUP
                  </p>
                </div>
                <div class="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    class="size-8"
                    @click="removeFromCurrentOrder(product.id)"
                  >
                    <Minus class="size-4" />
                  </Button>
                  <span class="w-8 text-center">
                    {{
                      currentOrderItems.find((i) => i.productId === product.id)
                        ?.quantity || 0
                    }}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    class="size-8"
                    @click="addToCurrentOrder(product.id)"
                  >
                    <Plus class="size-4" />
                  </Button>
                </div>
              </div>
              <div
                v-if="filteredProducts.length === 0"
                class="text-muted-foreground py-8 text-center"
              >
                No hay productos
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>

    <!-- Mobile Orders Sheet -->
    <Sheet v-model:open="showOrdersSheet">
      <SheetContent side="bottom" class="h-[80vh] rounded-t-xl p-0">
        <SheetHeader class="border-b p-4">
          <SheetTitle>Pedidos del día</SheetTitle>
          <SheetDescription>
            {{ ordersForCurrentDay.length }} pedidos registrados
          </SheetDescription>
        </SheetHeader>
        <div class="h-full overflow-y-auto p-4">
          <OrderList
            :orders="ordersForCurrentDay"
            :products="productStore.products"
            :day-prices="dayPricesMap"
            @edit="editOrder"
            @delete="deleteOrder"
          />
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
