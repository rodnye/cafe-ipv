<script setup lang="ts">
  import { useAuthStore } from '@/stores/auth';
  import { useRouter } from 'vue-router';
  import { Button } from '@/components/ui/button';
  import { Card, CardContent } from '@/components/ui/card';
  import { Coffee } from 'lucide-vue-next';
  import { name, version } from '../../package.json';

  const auth = useAuthStore();
  const router = useRouter();

  const loginAsGuest = () => {
    auth.loginAsGuest();
    router.push('/');
  };
</script>

<template>
  <div class="flex min-h-[80vh] items-center justify-center p-3">
    <Card>
      <CardContent>
        <div class="mb-6 flex justify-center">
          <div class="bg-primary/10 rounded-full p-3">
            <Coffee class="text-primary size-8" />
          </div>
        </div>
        <h2 class="text-primary mb-2 text-center text-xl font-bold md:text-2xl">
          My IPV
        </h2>
        <Button class="w-full gap-2" @click="loginAsGuest">
          Entrar como invitado
        </Button>
        <p class="text-card-foreground/50 mt-6 text-center text-sm">
          {{ name + ' v' + version }}
        </p>
      </CardContent>
    </Card>
  </div>
</template>
