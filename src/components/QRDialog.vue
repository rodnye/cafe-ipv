<script setup lang="ts">
  import { useCardStore } from '@/stores/card';
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
  import { QrcodeSvg } from 'qrcode.vue';
  import type { ICard } from '@/types';
  import qrLogo from '../assets/logo-transfermovil.png';

  const cardStore = useCardStore();

  const props = defineProps<{
    card: ICard;
    open: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
  }>();

  const getQRText = (card: ICard) => {
    return `TRANSFERMOVIL_ETECSA,TRANSFERENCIA,${card.cardNumber},${card.phoneNumber},`;
  };

  cardStore.loadCards();
</script>

<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center justify-between">
          <span>QR para {{ card?.alias }}</span>
        </DialogTitle>
      </DialogHeader>
      <div v-if="card" class="flex flex-col items-center space-y-4 py-4">
        <div class="rounded-lg bg-white p-4">
          <QrcodeSvg
            :image-settings="{
              src: qrLogo,
              width: 100,
              height: 100,
            }"
            :value="getQRText(card)"
            :size="200"
            level="H"
          />
        </div>
        <div class="w-full space-y-2 text-center">
          <p class="font-medium">{{ card.alias }}</p>
          <p class="text-muted-foreground text-sm">
            {{ card.cardNumber.match(/.{1,4}/g)?.join('-') }}
          </p>
          <p class="text-muted-foreground text-sm">
            {{ card.phoneNumber }}
          </p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
