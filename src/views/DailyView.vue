<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
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
  import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
  import { Input } from '@/components/ui/input';

  const dayStore = useDayStore();
  const tableStore = useTableStore();

  // Dialog state
  const showDateDialog = ref(false);
  const selectedDate = ref(new Date().toISOString().split('T')[0]);
  const dateError = ref('');

  const selectDedDay = ref(dayStore.currentDayId);
  console.log(selectDedDay.value);
  watch(selectDedDay, async (s) => {
    console.log('watched' + s);
    await dayStore.setCurrentDay(s);
  });

  const daysOptions = computed(() => {
    return dayStore.daysList.map((dayId) => ({
      value: dayId,
      label: dayId.replace(/^day\-/, ''),
    }));
  });

  const existingDates = computed(() => {
    return new Set(
      dayStore.daysList.map((dayId) => dayId.replace(/^day\-/, ''))
    );
  });

  const openDateDialog = () => {
    selectedDate.value = new Date().toISOString().split('T')[0];
    dateError.value = '';
    showDateDialog.value = true;
  };

  const validateDate = (date: string) => {
    if (existingDates.value.has(date)) {
      dateError.value = 'Ya existe un día con esta fecha';
      return false;
    }
    dateError.value = '';
    return true;
  };

  const handleDateChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    selectedDate.value = input.value;
    validateDate(input.value);
  };

  const createNewDay = async () => {
    if (!validateDate(selectedDate.value!)) return;

    const date = new Date(selectedDate.value!);
    await dayStore.createDay(date, dayStore.currentDayId);
    dayStore.currentDayId = dayStore.currentDayId;
    showDateDialog.value = false;
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
        <Select v-model="selectDedDay">
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
        <Button @click="openDateDialog" class="gap-2">
          <CalendarPlus class="size-4" />
          <span class="hidden sm:inline">Nuevo día</span>
          <span class="sm:hidden">Nuevo</span>
        </Button>
      </div>
    </div>

    <!-- Date selection dialog -->
    <Dialog v-model:open="showDateDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seleccionar fecha</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <Input
            :value="selectedDate"
            type="date"
            class="w-full"
            @input="handleDateChange"
          />
          <p v-if="dateError" class="text-destructive text-sm">
            {{ dateError }}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showDateDialog = false">
            Cancelar
          </Button>
          <Button @click="createNewDay" :disabled="!!dateError">
            Crear día
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

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
