<script setup lang="ts">
  import { useThemeStore } from '@/stores/theme';
  import { Button } from '@/components/ui/button';
  import { Sun, Moon } from 'lucide-vue-next';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
  import { computed } from 'vue';
  import type { AcceptableValue } from 'reka-ui';

  const themeStore = useThemeStore();

  const themes = [
    {
      value: 'theme-default',
      label: 'Predeterminado',
      color: 'bg-blue-500',
      description: 'Tema clásico azul',
    },
    {
      value: 'theme-aqua',
      label: 'Aqua',
      color: 'bg-cyan-500',
      description: 'Fresco y relajante a la vista',
    },
    {
      value: 'theme-nature',
      label: 'Natural',
      color: 'bg-green-500',
      description: 'Verde natural y orgánico',
    },
    {
      value: 'theme-coffee',
      label: 'Cafecito',
      color: 'bg-amber-600',
      description: 'Estilo café y elegante',
    },
    {
      value: 'theme-pink-tulip',
      label: 'Tulipán rosa',
      color: 'bg-pink-500',
      description: 'Un toque rosa a tus ventas',
    },
    {
      value: 'theme-purple-tulip',
      label: 'Tulipán morado',
      color: 'bg-purple-500',
      description: 'Para ARMYS y escritoras cutes',
    },
  ];

  const currentThemeLabel = computed(() => {
    const theme = themes.find((t) => t.value === themeStore.currentTheme);
    return theme?.label || themes[0]!.label;
  });
</script>

<template>
  <div class="flex items-center gap-2">
    <Button
      variant="outline"
      size="icon"
      @click="themeStore.toggleDarkMode"
      :title="themeStore.isDark ? 'Modo claro' : 'Modo oscuro'"
      class="shrink-0"
    >
      <Sun v-if="!themeStore.isDark" class="size-4" />
      <Moon v-else class="size-4" />
    </Button>

    <Select
      :model-value="themeStore.currentTheme"
      @update:model-value="
        themeStore.setTheme as (value: AcceptableValue) => any
      "
    >
      <SelectTrigger class="w-36 gap-2">
        <div class="flex items-center gap-2">
          <div
            class="size-3 rounded-full"
            :class="
              themes.find((t) => t.value === themeStore.currentTheme)?.color
            "
          ></div>
          <SelectValue>
            {{ currentThemeLabel }}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="theme in themes"
          :key="theme.value"
          :value="theme.value"
          class="cursor-pointer"
        >
          <div class="flex items-center gap-3">
            <div class="size-3 rounded-full" :class="theme.color"></div>
            <div class="flex flex-col items-start">
              <span class="font-medium">{{ theme.label }}</span>
              <span class="text-muted-foreground text-xs">{{
                theme.description
              }}</span>
            </div>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
