<script setup lang="ts">
  import type { Day, DayProductEntry } from '@/types';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import { Input } from '@/components/ui/input';

  const props = defineProps<{ day: Day }>();
  const emit = defineEmits<{
    (
      e: 'update',
      dayId: string,
      productId: string,
      field: keyof DayProductEntry,
      value: number
    ): void;
  }>();

  const updateField = (
    productId: string,
    field: keyof DayProductEntry,
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
        <TableRow class="bg-muted/50">
          <TableHead class="whitespace-nowrap">Producto</TableHead>
          <TableHead class="whitespace-nowrap">Inicio</TableHead>
          <TableHead class="whitespace-nowrap">Entrada</TableHead>
          <TableHead class="whitespace-nowrap">Salida</TableHead>
          <TableHead class="whitespace-nowrap">Total</TableHead>
          <TableHead class="whitespace-nowrap">Precio</TableHead>
          <TableHead class="whitespace-nowrap">Vendido</TableHead>
          <TableHead class="whitespace-nowrap">Importe</TableHead>
          <TableHead class="whitespace-nowrap">Final</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="entry in day.products"
          :key="entry.productId"
          class="hover:bg-muted/30"
        >
          <TableCell class="font-medium whitespace-nowrap">{{
            entry.productName
          }}</TableCell>
          <TableCell>
            <Input
              type="number"
              :value="entry.inicio"
              @change="(e: Event) => updateField(entry.productId, 'inicio', e)"
              class="h-8 w-16 md:w-20"
              min="0"
            />
          </TableCell>
          <TableCell>
            <Input
              type="number"
              :value="entry.entrada"
              @change="(e: Event) => updateField(entry.productId, 'entrada', e)"
              class="h-8 w-16 md:w-20"
              min="0"
            />
          </TableCell>
          <TableCell>
            <Input
              type="number"
              :value="entry.salida"
              @change="(e: Event) => updateField(entry.productId, 'salida', e)"
              class="h-8 w-16 md:w-20"
              min="0"
            />
          </TableCell>
          <TableCell class="font-mono">{{
            entry.inicio + entry.entrada
          }}</TableCell>
          <TableCell>
            <Input
              type="number"
              :value="entry.precio"
              @change="(e: Event) => updateField(entry.productId, 'precio', e)"
              class="h-8 w-16 md:w-20"
              min="0"
            />
          </TableCell>
          <TableCell class="font-mono">{{ entry.vendido }}</TableCell>
          <TableCell class="font-mono font-medium"
            >{{ entry.importe }} CUP</TableCell
          >
          <TableCell class="font-mono">{{ entry.final }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
