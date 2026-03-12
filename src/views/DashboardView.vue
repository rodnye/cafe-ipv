<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useProductStore } from '@/stores/product';
  import { useDayStore } from '@/stores/day';
  import ProductCard from '@/components/ProductCard.vue';
  import Cart from '@/components/Cart.vue';
  import { Button } from '@/components/ui/button';
  import { ChevronDown } from 'lucide-vue-next';

  const productStore = useProductStore();
  const dayStore = useDayStore();

  onMounted(() => {
    productStore.load();
    dayStore.load();
    if (!dayStore.currentDay) {
      dayStore.createDayFromPrevious(null);
    }
  });

  const limit = ref(8);
  const productsToShow = computed(() =>
    productStore.products.slice(0, limit.value)
  );

  const showMore = () => {
    limit.value += 8;
  };
</script>

<template>
  <div class="flex flex-col gap-4 lg:flex-row lg:gap-6">
    <div class="order-2 flex-1 lg:order-1">
      <h2 class="text-primary mb-4 text-xl font-bold md:text-2xl">Productos</h2>
      <div
        class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 xl:grid-cols-4"
      >
        <ProductCard
          v-for="product in productsToShow"
          :key="product.id"
          :product="product"
          @add-to-cart="dayStore.addToCart(product.id, 1)"
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

    <aside class="order-1 lg:order-2 lg:w-80">
      <Cart :items="dayStore.cartItems" :total="dayStore.totalImporte" />
    </aside>
  </div>
</template>
