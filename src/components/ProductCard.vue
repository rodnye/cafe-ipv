<script setup lang="ts">
  import type { Product } from '@/types';
  import { Card, CardContent, CardFooter } from '@/components/ui/card';
  import { Button } from '@/components/ui/button';
  import { ShoppingBag } from 'lucide-vue-next';

  defineProps<{ product: Product }>();
  defineEmits<{ (e: 'addToCart'): void }>();
</script>

<template>
  <Card class="border-primary/10 shadow-md transition-shadow hover:shadow-lg">
    <CardContent class="pt-5 pb-3">
      <h3 class="text-base font-semibold md:text-lg">{{ product.name }}</h3>
      <p class="text-muted-foreground text-sm md:text-base">
        {{ product.price }} CUP
      </p>
    </CardContent>
    <CardFooter>
      <Button class="w-full gap-2" size="sm" @click="$emit('addToCart')">
        <ShoppingBag class="size-4" />
        Añadir
      </Button>
    </CardFooter>
  </Card>
</template>
