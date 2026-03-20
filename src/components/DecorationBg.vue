<script setup lang="ts">
  import { useAuthStore } from '@/stores/auth';
  import cuteTulip from '@/assets/cute-tulip.webp';
  import { computed } from 'vue';
  import { useThemeStore } from '@/stores/theme';

  const auth = useAuthStore();
  const theme = useThemeStore();

  const isTulipTheme = computed(() => theme.currentTheme === 'theme-tulip');
</script>

<template>
  <div
    v-if="isTulipTheme && auth.user"
    class="pointer-events-none fixed bottom-4 left-4 z-0"
  >
    <img
      :src="cuteTulip"
      alt="Tulipán decorativo"
      class="decor-tulip"
      :class="{
        'transition-transform duration-300 hover:scale-105': true,
      }"
    />
  </div>
</template>
