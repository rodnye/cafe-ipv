<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useDayStore } from '@/stores/day';
  import { Button } from '@/components/ui/button';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
  import DayTable from '@/components/DayTable.vue';
  import { CalendarPlus } from 'lucide-vue-next';
  import { useTableStore } from '@/stores/table';

  const dayStore = useDayStore();
  const tableStore = useTableStore();
  const selectedDayId = ref(dayStore.currentDayId);

  const daysOptions = computed(() => {
    return dayStore.daysList.map((dayId) => ({
      value: dayId,
      label: dayId.replace(/^day\-/, ''),
    }));
  });

  const createNewDay = async () => {
    await dayStore.createDay(new Date(), selectedDayId.value);
    selectedDayId.value = dayStore.currentDayId;
  };
</script>

<template>
  <div class="space-y-4">
    <div
      class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"
    >
      <h2 class="text-primary text-xl font-bold md:text-2xl">
        Tabla Diaria IPV
      </h2>
      <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Select v-model="selectedDayId">
          <SelectTrigger class="w-full sm:w-45">
            <SelectValue placeholder="Seleccionar día" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="day in daysOptions"
              :key="day.value"
              :value="day.value"
            >
              {{ day.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Button @click="createNewDay" class="gap-2">
          <CalendarPlus class="size-4" />
          <span class="hidden sm:inline">Nuevo día</span>
          <span class="sm:hidden">Nuevo</span>
        </Button>
      </div>
    </div>

    <div v-if="dayStore.currentDay">
      <DayTable :day="dayStore.currentDay" @update="tableStore.updateField" />
    </div>
    <div
      v-else
      class="text-muted-foreground bg-card rounded-lg border py-12 text-center shadow-sm"
    >
      No hay días disponibles. Crea uno nuevo.
    </div>
  </div>
</template>
