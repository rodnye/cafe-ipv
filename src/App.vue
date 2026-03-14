<script setup lang="ts">
  import { useAuthStore } from '@/stores/auth';
  import { useRouter } from 'vue-router';
  import { Button } from '@/components/ui/button';
  import {
    Menu,
    Home,
    Package,
    Calendar,
    Settings,
    LogOut,
  } from 'lucide-vue-next';
  import { ref } from 'vue';
  import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
  } from './components/ui/sheet';

  const auth = useAuthStore();
  const router = useRouter();
  const mobileMenuOpen = ref(false);

  const logout = () => {
    auth.logout();
    router.push('/login');
  };

  const closeMenu = () => {
    mobileMenuOpen.value = false;
  };

  const navigation = [
    { path: '/', name: 'Inicio', icon: Home },
    { path: '/products', name: 'Productos', icon: Package },
    { path: '/daily', name: 'Tabla Diaria', icon: Calendar },
    { path: '/settings', name: 'Configuración', icon: Settings },
  ];
</script>

<template>
  <div class="bg-background flex h-full flex-col">
    <header
      v-if="auth.user"
      class="bg-card/80 sticky top-0 z-10 border-b shadow-sm backdrop-blur-sm"
    >
      <div
        class="container mx-auto flex items-center justify-between p-3 md:p-4"
      >
        <h1 class="text-primary text-lg font-bold md:text-xl">Cafetería IPV</h1>

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
      class="container mx-auto flex grow flex-col overflow-y-auto p-3 md:p-4"
    >
      <router-view />
    </main>
  </div>
</template>
