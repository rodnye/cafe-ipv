import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ name: string; isGuest: boolean } | null>(null);

  const loginAsGuest = () => {
    user.value = { name: 'Invitado', isGuest: true };
  };

  const logout = () => {
    user.value = null;
  };

  return { user, loginAsGuest, logout };
});
