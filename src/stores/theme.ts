import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

import '../themes/default.css';
import '../themes/aqua.css';
import '../themes/coffee.css';
import '../themes/nature.css';
import '../themes/tulip.css';

export type ThemeName =
  | 'theme-default'
  | 'theme-aqua'
  | 'theme-nature'
  | 'theme-coffee'
  | 'theme-tulip';

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeName>('theme-default');
  const isDark = ref(false);

  //
  const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme') as ThemeName | null;
    if (
      savedTheme &&
      [
        'theme-default',
        'theme-aqua',
        'theme-nature',
        'theme-coffee',
        'theme-tulip',
      ].includes(savedTheme)
    ) {
      currentTheme.value = savedTheme;
    }

    const savedDark = localStorage.getItem('dark-mode');
    if (savedDark !== null) {
      isDark.value = savedDark === 'true';
    } else {
      // Check system preference first
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  };

  const setTheme = (theme: ThemeName) => {
    currentTheme.value = theme;
    localStorage.setItem('theme', theme);
    applyTheme();
  };

  const setDarkMode = (dark: boolean) => {
    isDark.value = dark;
    localStorage.setItem('dark-mode', String(dark));
    applyTheme();
  };

  const toggleDarkMode = () => {
    setDarkMode(!isDark.value);
  };

  const applyTheme = () => {
    const root = document.documentElement;
    root.classList.remove(
      ...[...root.classList.values()].filter((clas) =>
        clas.startsWith('theme-')
      )
    );
    root.classList.add(currentTheme.value);

    if (isDark.value) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Watch for changes
  watch([currentTheme, isDark], () => {
    applyTheme();
  });

  return {
    currentTheme,
    isDark,
    setTheme,
    setDarkMode,
    toggleDarkMode,

    init() {
      loadTheme();
      applyTheme();
    },
  };
});
