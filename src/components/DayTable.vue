<script setup lang="ts">
  import type {
    IDay,
    IDayId,
    IMutableProductDailyField,
    IProductId,
  } from '@/types';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import { Input } from '@/components/ui/input';

  const props = defineProps<{ day: IDay }>();
  const emit = defineEmits<{
    (
      e: 'update',
      dayId: IDayId,
      productId: IProductId,
      field: IMutableProductDailyField | 'price',
      value: number
    ): void;
  }>();

  const updateField = (
    productId: IProductId,
    field: IMutableProductDailyField | 'price',
    event: Event
  ) => {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value) || 0;
    emit('update', props.day.id, productId, field, value);
  };
</script>

<template>
  <div class="overflow-x-auto rounded-lg border shadow-sm">
    <Table>
      <TableHeader>
        <TableRow class="bg-muted/50 *:whitespace-nowrap">
          <TableHead>Producto</TableHead>
          <TableHead>Inicio</TableHead>
          <TableHead>Entrada</TableHead>
          <TableHead>Salida</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead>Vendido</TableHead>
          <TableHead>Importe</TableHead>
          <TableHead>Final</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="entry in day.products"
          :key="entry.id"
          class="hover:bg-muted/30"
        >
          <TableCell class="font-medium whitespace-nowrap">{{
            entry.name
          }}</TableCell>
          <TableCell>
            <Input
              type="number"
              :value="entry.daily.inicio"
              @input="(e: Event) => updateField(entry.id, 'inicio', e)"
              class="h-8 w-16 md:w-20"
              min="0"
            />
          </TableCell>
          <TableCell>
            <Input
              type="number"
              :value="entry.daily.entrada"
              @input="(e: Event) => updateField(entry.id, 'entrada', e)"
              class="h-8 w-16 md:w-20"
              min="0"
            />
          </TableCell>
          <TableCell>
            <Input
              type="number"
              :value="entry.daily.salida"
              @input="(e: Event) => updateField(entry.id, 'salida', e)"
              class="h-8 w-16 md:w-20"
              min="0"
            />
          </TableCell>
          <TableCell class="font-mono">{{ entry.daily.total }}</TableCell>
          <TableCell>
            <Input
              type="number"
              :value="entry.price"
              @input="(e: Event) => updateField(entry.id, 'price', e)"
              class="h-8 w-16 md:w-20"
              min="0"
            />
          </TableCell>
          <TableCell class="font-mono">{{ entry.daily.vendido }}</TableCell>
          <TableCell class="font-mono font-medium"
            >{{ entry.daily.importe }} CUP</TableCell
          >
          <TableCell class="font-mono">{{ entry.daily.final }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
