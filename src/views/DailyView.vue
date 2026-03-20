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
  import { CalendarPlus, Settings, Pencil, Trash2 } from 'lucide-vue-next';
  import { useTableStore } from '@/stores/table';
  import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
  } from '@/components/ui/dialog';
  import { Input } from '@/components/ui/input';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import type { IDayId } from '@/types';

  const dayStore = useDayStore();
  const tableStore = useTableStore();

  // Dialog state for new day
  const showDateDialog = ref(false);
  const selectedDate = ref(new Date().toISOString().split('T')[0]);
  const dateError = ref('');

  // Day selector
  const selectDedDay = ref(dayStore.currentDayId);
  watch(selectDedDay, async (newId) => {
    if (newId) await dayStore.setCurrentDay(newId);
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

  // New day dialog
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
    showDateDialog.value = false;
  };

  // Day management dialog
  const showManagementDialog = ref(false);
  const showEditDateDialog = ref(false);
  const editingDayId = ref<IDayId | null>(null);
  const editDateValue = ref('');
  const editDateError = ref('');

  const openEditDateDialog = (dayId: IDayId) => {
    editingDayId.value = dayId;
    editDateValue.value = dayId.replace('day-', '');
    editDateError.value = '';
    showEditDateDialog.value = true;
  };

  const handleEditDateChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    editDateValue.value = input.value;
    validateEditDate();
  };

  const validateEditDate = () => {
    if (!editingDayId.value) return false;
    const newDate = editDateValue.value;
    if (!newDate) {
      editDateError.value = 'Selecciona una fecha';
      return false;
    }

    const existing = dayStore.daysList.find(
      (id) => id === `day-${newDate}` && id !== editingDayId.value
    );
    if (existing) {
      editDateError.value = 'Ya existe un día con esta fecha';
      return false;
    }
    editDateError.value = '';
    return true;
  };

  const saveEditDate = async () => {
    if (!validateEditDate() || !editingDayId.value) return;
    try {
      await dayStore.updateDayDate(editingDayId.value, editDateValue.value);
      showEditDateDialog.value = false;
    } catch (error) {
      editDateError.value = (error as Error).message;
    }
  };

  const confirmDeleteDay = async (dayId: IDayId) => {
    if (
      !confirm(
        `¿Estás seguro de eliminar el día ${dayId.replace('day-', '')}? Esta acción no se puede deshacer.`
      )
    )
      return;
    await dayStore.deleteDay(dayId);
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
        <Button
          @click="showManagementDialog = true"
          variant="outline"
          class="gap-2"
        >
          <Settings class="size-4" />
          <span class="hidden sm:inline">Gestionar días</span>
          <span class="sm:hidden">Días</span>
        </Button>
      </div>
    </div>

    <!-- Create day dialog -->
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

    <!-- Day management dialog -->
    <Dialog v-model:open="showManagementDialog">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gestionar días</DialogTitle>
          <DialogDescription>
            Aquí puedes editar o eliminar días existentes. Ten cuidado, los
            cambios son permanentes.
          </DialogDescription>
        </DialogHeader>
        <div class="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead class="w-32">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="dayId in dayStore.daysList" :key="dayId">
                <TableCell>{{ dayId.replace('day-', '') }}</TableCell>
                <TableCell>
                  <div class="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      @click="openEditDateDialog(dayId)"
                    >
                      <Pencil class="size-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      @click="confirmDeleteDay(dayId)"
                    >
                      <Trash2 class="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showManagementDialog = false">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Edit date dialog -->
    <Dialog v-model:open="showEditDateDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar fecha del día</DialogTitle>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <Input
            :value="editDateValue"
            type="date"
            class="w-full"
            @input="handleEditDateChange"
          />
          <p v-if="editDateError" class="text-destructive text-sm">
            {{ editDateError }}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showEditDateDialog = false">
            Cancelar
          </Button>
          <Button @click="saveEditDate" :disabled="!!editDateError">
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Day table -->
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
