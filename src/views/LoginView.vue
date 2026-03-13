<script setup lang="ts">
  import { useAuthStore } from '@/stores/auth';
  import { useRouter } from 'vue-router';
  import { Button } from '@/components/ui/button';
  import { Card, CardContent, CardFooter } from '@/components/ui/card';
  import { Coffee } from 'lucide-vue-next';
  import { repository, version } from '../../package.json';

  const auth = useAuthStore();
  const router = useRouter();

  const loginAsGuest = () => {
    auth.loginAsGuest();
    router.push('/');
  };
</script>

<template>
  <div class="flex min-h-[80vh] flex-col items-center justify-center p-2">
    <div class="w-full max-w-md">
      <div class="mb-6 text-center">
        <div
          class="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
        >
          <Coffee class="text-primary h-8 w-8" />
        </div>
        <h1 class="text-foreground text-2xl font-bold">Cafetería IPV</h1>
        <p class="text-muted-foreground mt-1 text-sm">
          Sistema de gestión para cafetería
        </p>
      </div>

      <Card class="border-primary/20 shadow-lg">
        <CardContent class="pt-6">
          <div class="space-y-4">
            <Button
              class="w-full gap-2 py-6 text-base"
              size="lg"
              @click="loginAsGuest"
            >
              <Coffee class="h-5 w-5" />
              Entrar como invitado
            </Button>

            <div
              class="bg-primary/5 flex items-center justify-between rounded-lg px-3 py-2"
            >
              <span class="text-muted-foreground text-xs">Versión</span>
              <span class="font-mono text-xs font-medium">
                v{{ version }}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter
          class="bg-muted/30 flex-col items-center gap-2 border-t py-3"
        >
          <a
            :href="repository.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-muted-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors"
          >
            <svg
              class="h-4 w-4"
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>GitHub</title>
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>
            <span>Ver en GitHub</span>
          </a>
          <p class="text-muted-foreground text-xs">© 2026 Open Source</p>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>
