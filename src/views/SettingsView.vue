<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
  import { Download, Upload, AlertTriangle } from 'lucide-vue-next';
  import { useAuthStore } from '@/stores/auth';

  const router = useRouter();
  const authStore = useAuthStore();

  // Export
  const showExportDialog = ref(false);
  const exportData = ref('');

  // Import
  const showImportDialog = ref(false);
  const importFile = ref<File | null>(null);
  const importError = ref('');
  const confirmText = ref('');
  const isImporting = ref(false);

  const handleExport = () => {
    const keys = Object.keys(localStorage);
    const cafeData: Record<string, string> = {};

    keys.forEach((key) => {
      if (key.startsWith('v2.cafeteria-')) {
        cafeData[key] = localStorage.getItem(key) || '';
      }
    });

    exportData.value = JSON.stringify(cafeData, null, 2);
    showExportDialog.value = true;
  };

  const downloadExport = () => {
    const blob = new Blob([exportData.value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cafeteria-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showExportDialog.value = false;
  };

  const handleFileSelect = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      importFile.value = input.files[0]!;
      importError.value = '';
    }
  };

  const handleImport = async () => {
    if (!importFile.value) {
      importError.value = 'Selecciona un archivo';
      return;
    }

    if (confirmText.value !== 'borrar') {
      importError.value = 'Escribe "borrar" para confirmar';
      return;
    }

    try {
      isImporting.value = true;
      const text = await importFile.value.text();
      const importedData = JSON.parse(text);

      const hasCafeData = Object.keys(importedData).some((key) =>
        key.startsWith('v2.cafeteria-')
      );

      if (!hasCafeData) {
        throw new Error('El archivo no contiene datos válidos para la app :(');
      }

      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('v2.cafeteria-')) {
          localStorage.removeItem(key);
        }
      });

      Object.entries(importedData).forEach(([key, value]) => {
        localStorage.setItem(key, value as string);
      });

      //r eset and reload
      showImportDialog.value = false;
      confirmText.value = '';
      importFile.value = null;
      authStore.logout();
      await router.push('/login');
      window.location.reload();
    } catch (error) {
      importError.value =
        error instanceof Error ? error.message : 'Error al importar';
    } finally {
      isImporting.value = false;
    }
  };
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-primary text-xl font-bold md:text-2xl">Configuración</h2>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- Export Card -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Download class="size-5" />
            Exportar datos
          </CardTitle>
          <CardDescription>
            Descarga una copia de seguridad de todos los datos de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button @click="handleExport" class="w-full gap-2">
            <Download class="size-4" />
            Exportar JSON
          </Button>
        </CardContent>
      </Card>

      <!-- Import Card -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Upload class="size-5" />
            Importar datos
          </CardTitle>
          <CardDescription>
            Restaura una copia de seguridad. Esta acción reemplazará todos los
            datos actuales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            class="w-full gap-2"
            @click="showImportDialog = true"
          >
            <Upload class="size-4" />
            Importar JSON
          </Button>
        </CardContent>
      </Card>
    </div>

    <Dialog v-model:open="showExportDialog">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Exportar datos</DialogTitle>
          <DialogDescription>
            Vista previa de los datos a exportar. Haz clic en Descargar para
            guardar el archivo.
          </DialogDescription>
        </DialogHeader>
        <div
          class="max-h-96 overflow-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-900"
        >
          <pre class="text-xs">{{ exportData }}</pre>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showExportDialog = false">
            Cancelar
          </Button>
          <Button @click="downloadExport">
            <Download class="mr-2 size-4" />
            Descargar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="showImportDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="text-destructive flex items-center gap-2">
            <AlertTriangle class="size-5" />
            ¡Advertencia!
          </DialogTitle>
          <DialogDescription class="space-y-4">
            <p class="font-medium text-red-600 dark:text-red-400">
              Esta acción eliminará TODOS los datos actuales y los reemplazará
              con los datos del archivo importado.
            </p>
            <p>
              Para confirmar, escribe
              <span class="font-mono font-bold">borrar</span> en el campo
              siguiente:
            </p>
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-2">
          <Input
            v-model="confirmText"
            placeholder="Escribe 'borrar' para confirmar"
            :disabled="isImporting"
          />

          <div class="space-y-2">
            <label class="text-sm font-medium">Archivo de respaldo</label>
            <Input
              type="file"
              accept=".json,application/json"
              @change="handleFileSelect"
              :disabled="isImporting"
            />
          </div>

          <p v-if="importError" class="text-destructive text-sm">
            {{ importError }}
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            @click="showImportDialog = false"
            :disabled="isImporting"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            @click="handleImport"
            :disabled="confirmText !== 'borrar' || !importFile || isImporting"
          >
            <Upload v-if="!isImporting" class="mr-2 size-4" />
            <span v-else class="mr-2 size-4 animate-spin">⏳</span>
            Importar y reemplazar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
