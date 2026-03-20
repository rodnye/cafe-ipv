<script setup lang="ts">
  import { useAuthStore } from '@/stores/auth';
  import { useRouter, useRoute } from 'vue-router';
  import { Button } from '@/components/ui/button';
  import {
    Menu,
    Home,
    Package,
    Calendar,
    Settings,
    LogOut,
    AlertCircle,
    CalendarPlus,
  } from 'lucide-vue-next';
  import { onMounted, ref, watch } from 'vue';
  import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
  } from './components/ui/sheet';
  import { useThemeStore } from './stores/theme';
  import DecorationBg from './components/DecorationBg.vue';
  import { useDayCheckStore } from './stores/dayCheck';
  import { useDayStore } from './stores/day';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from './components/ui/dialog';

  const auth = useAuthStore();
  const theme = useThemeStore();
  const router = useRouter();
  const route = useRoute();
  const mobileMenuOpen = ref(false);
  const dayCheckStore = useDayCheckStore();
  const dayStore = useDayStore();

  const logout = () => {
    auth.logout();
    router.push('/login');
  };

  const closeMenu = () => {
    mobileMenuOpen.value = false;
  };

  const watcher1 = watch(auth, async () => {
    if (auth.user) {
      watcher1.stop();
      dayCheckStore.$dispose();
      await dayStore.init();
      await dayCheckStore.checkCurrentDay();
    }
  });

  onMounted(async () => {
    theme.init();
  });

  const navigation = [
    { path: '/', name: 'Inicio', icon: Home },
    { path: '/products', name: 'Productos', icon: Package },
    { path: '/daily', name: 'Tabla Diaria', icon: Calendar },
    { path: '/settings', name: 'Configuración', icon: Settings },
  ];
</script>

<template>
  <div class="bg-background relative flex h-full flex-col">
    <DecorationBg />

    <!-- Confirm day -->
    <Dialog v-model:open="dayCheckStore.showWarning">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2 text-2xl">
            <AlertCircle
              v-if="dayCheckStore.warningType === 'new'"
              class="text-primary size-6"
            />
            <AlertCircle v-else class="size-6 text-amber-500" />
            {{
              dayCheckStore.warningType === 'new'
                ? 'Nuevo día'
                : 'Día no seleccionado'
            }}
          </DialogTitle>
          <DialogDescription class="space-y-2 pt-2">
            <p v-if="dayCheckStore.warningType === 'new'" class="text-base">
              El día de hoy ({{ new Date().toLocaleDateString('es-ES') }}) no
              existe en el sistema.
            </p>
            <p v-else class="text-base">
              Actualmente estás viendo un día diferente al actual. El día de hoy
              es {{ new Date().toLocaleDateString('es-ES') }}.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div class="py-4">
          <p
            v-if="dayCheckStore.warningType === 'new'"
            class="text-muted-foreground"
          >
            ¿Quieres comenzar un nuevo día?
          </p>
          <p v-else class="text-muted-foreground">
            ¿Quieres reanudar las ventas para hoy?
          </p>
        </div>

        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="outline" @click="dayCheckStore.cancel">
            Cancelar
          </Button>
          <Button
            v-if="dayCheckStore.warningType === 'new'"
            @click="dayCheckStore.startNewDay"
            class="gap-2"
          >
            <CalendarPlus class="size-4" />
            Comenzar nuevo día
          </Button>
          <Button v-else @click="dayCheckStore.resumeCurrentDay" class="gap-2">
            <Calendar class="size-4" />
            Reanudar día actual
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <header
      v-if="auth.user"
      class="bg-card/80 sticky top-0 z-10 border-b shadow-sm backdrop-blur-sm"
    >
      <div
        class="container mx-auto flex items-center justify-between p-3 md:p-4"
      >
        <!-- Desktop: App name -->
        <h1 class="text-primary hidden text-lg font-bold md:block md:text-xl">
          Cafetería IPV
        </h1>

        <!-- Mobile: Current section name -->
        <h1 class="text-primary block text-xl font-bold md:hidden">
          {{ route.name }}
        </h1>

        <div class="flex items-center gap-2">
          <!-- Desktop navigation -->
          <nav class="mr-4 hidden items-center gap-1 md:flex">
            <router-link
              v-for="item in navigation"
              :key="item.path"
              :to="item.path"
              class="hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors"
              active-class="bg-accent font-medium"
            >
              {{ item.name }}
            </router-link>
          </nav>

          <span
            class="text-muted-foreground hidden text-sm sm:inline md:text-base"
            >{{ auth.user.name }}</span
          >
          <Button
            variant="outline"
            size="sm"
            @click="logout"
            class="hidden sm:inline-flex"
          >
            <LogOut class="mr-2 size-4" />
            Salir
          </Button>
          <Button
            variant="ghost"
            size="icon"
            @click="mobileMenuOpen = true"
            class="md:hidden"
          >
            <Menu class="size-5" />
          </Button>
        </div>
      </div>

      <!-- Mobile menu sheet -->
      <Sheet v-model:open="mobileMenuOpen">
        <SheetContent side="left" class="w-70 p-0 sm:w-87.5">
          <SheetHeader class="border-b p-4">
            <SheetTitle class="text-left">Cafetería IPV</SheetTitle>
          </SheetHeader>

          <div class="flex h-full flex-col">
            <!-- User info -->
            <div class="bg-muted/30 border-b p-4">
              <p class="text-muted-foreground text-sm">Conectado como</p>
              <p class="font-medium">{{ auth.user.name }}</p>
            </div>

            <!-- Navigation links -->
            <nav class="flex-1 p-2">
              <router-link
                v-for="item in navigation"
                :key="item.path"
                :to="item.path"
                class="hover:bg-accent flex items-center gap-3 rounded-md px-3 py-3 transition-colors"
                active-class="bg-accent font-medium"
                @click="closeMenu"
              >
                <component :is="item.icon" class="size-5" />
                {{ item.name }}
              </router-link>
            </nav>

            <!-- Logout button at bottom -->
            <div class="border-t p-4">
              <Button
                variant="outline"
                class="w-full justify-start gap-3"
                @click="logout"
              >
                <LogOut class="size-5" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>

    <main
      class="relative z-1 container mx-auto flex grow flex-col overflow-y-auto p-3 md:p-4"
    >
      <router-view />
    </main>
  </div>
</template>
