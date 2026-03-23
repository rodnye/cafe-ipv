<script setup lang="ts">
  import type { ICard } from '@/types';
  import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
  } from '@/components/ui/sheet';
  import { Card, CardContent } from '@/components/ui/card';
  import { QrCode } from 'lucide-vue-next';

  defineProps<{
    open: boolean;
    cards: ICard[];
  }>();

  const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'select-card', card: ICard): void;
  }>();

  const handleSelectCard = (card: ICard) => {
    emit('select-card', card);
    emit('update:open', false);
  };

  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.match(/.{1,4}/g)?.join('-') || cardNumber;
  };
</script>

<template>
  <Sheet :open="open" @update:open="(val) => emit('update:open', val)">
    <SheetContent side="bottom" class="rounded-t-xl p-0">
      <SheetHeader class="border-b p-4">
        <SheetTitle>Seleccionar tarjeta</SheetTitle>
        <SheetDescription>
          Elige la tarjeta para mostrar el código QR de pago
        </SheetDescription>
      </SheetHeader>
      <div class="max-h-[60vh] overflow-y-auto p-4">
        <div class="space-y-3">
          <Card
            v-for="card in cards"
            :key="card.id"
            class="cursor-pointer transition-all hover:shadow-md"
            @click="handleSelectCard(card)"
          >
            <CardContent class="flex items-center justify-between p-4">
              <div class="flex-1">
                <p class="font-semibold">{{ card.alias }}</p>
                <p class="text-muted-foreground text-sm">
                  {{ formatCardNumber(card.cardNumber) }}
                </p>
                <p class="text-muted-foreground text-xs">
                  {{ card.phoneNumber }}
                </p>
              </div>
              <QrCode class="text-primary size-6" />
            </CardContent>
          </Card>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
