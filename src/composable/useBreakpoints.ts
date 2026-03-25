import { useMediaQuery } from '@vueuse/core';
import { computed } from 'vue';

export function useBreakpoints() {
  const sm = useMediaQuery('(min-width: 640px)');
  const md = useMediaQuery('(min-width: 768px)');
  const lg = useMediaQuery('(min-width: 1024px)');
  const xl = useMediaQuery('(min-width: 1280px)');
  const xxl = useMediaQuery('(min-width: 1536px)');

  const isMobile = computed(() => !md.value);
  const isTablet = computed(() => md.value && !lg.value);
  const isDesktop = computed(() => lg.value);

  return {
    sm,
    md,
    lg,
    xl,
    xxl,
    isMobile,
    isTablet,
    isDesktop,
  };
}
