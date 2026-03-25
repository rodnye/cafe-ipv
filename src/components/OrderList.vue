<script setup lang="ts">
  import type { IOrder, IOrderId } from '@/types';
  import { Button } from '@/components/ui/button';
  import { Edit, Trash2 } from 'lucide-vue-next';

  const props = defineProps<{
    orders: IOrder[];
  }>();

  const emit = defineEmits<{
    (e: 'edit', orderId: IOrderId): void;
    (e: 'delete', orderId: IOrderId): void;
  }>();

  /*const orderTotal = (order: IOrder) => {
    return order.items.reduce((sum, item) => {
      const price = props.dayPrices.get(item.productId) || 0;
      return sum + price * item.quantity;
    }, 0);
  };*/

  const itemCount = (order: IOrder) => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  };
</script>

<template>
  <div class="space-y-2">
    <div
      v-if="!orders.length"
      class="text-muted-foreground py-4 text-center text-sm"
    >
      No hay pedidos
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="(order, index) in orders"
        :key="order.id"
        class="bg-muted/30 rounded-md border p-2"
      >
        <div class="flex items-center justify-between">
          <div>
            <span class="text-sm font-medium">
              Pedido
              <span class="hidden lg:inline">#{{ order.id.slice(0, 4) }}</span>
            </span>
            <span class="lg:hidden">#{{ orders.length - index }}</span>
            <span class="text-muted-foreground ml-2 text-xs"
              >{{ itemCount(order) }} artículos</span
            >
            <span
              v-if="order.createdAt"
              class="text-muted-foreground ml-2 text-xs"
            >
              {{ new Date(order.createdAt).toLocaleTimeString() }}
            </span>
          </div>
          <div class="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              class="size-7"
              @click="emit('edit', order.id)"
            >
              <Edit class="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="text-destructive size-7"
              @click="emit('delete', order.id)"
            >
              <Trash2 class="size-4" />
            </Button>
          </div>
        </div>
        <!--div class="text-primary mt-1 text-right text-sm font-bold">
          {{ orderTotal(order) }} CUP
        </div-->
      </div>
    </div>
  </div>
</template>
