import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/**
 *
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1]!;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export function useFileHandler() {
  const isAndroid =
    Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

  /**
   *
   */
  const downloadWeb = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   *
   */
  const saveToDevice = async (
    blob: Blob,
    fileName: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const base64 = await blobToBase64(blob);
      await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Documents,
      });
      return {
        success: true,
        message: `Archivo guardado en Documentos/${fileName}`,
      };
    } catch (error) {
      console.error('Error saving file:', error);
      return { success: false, message: 'Error al guardar el archivo' };
    }
  };

  /**
   * Comparte el archivo (Android) usando Share
   */
  const shareFile = async (
    blob: Blob,
    fileName: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const base64 = await blobToBase64(blob);
      const tempFileName = `temp_${Date.now()}_${fileName}`;
      await Filesystem.writeFile({
        path: tempFileName,
        data: base64,
        directory: Directory.Cache,
      });
      const uri = await Filesystem.getUri({
        path: tempFileName,
        directory: Directory.Cache,
      });
      await Share.share({
        title: 'Compartir archivo',
        text: 'Archivo de respaldo de Cafetería IPV',
        url: uri.uri,
        dialogTitle: 'Compartir archivo',
      });
      await Filesystem.deleteFile({
        path: tempFileName,
        directory: Directory.Cache,
      });
      return { success: true, message: 'Archivo compartido' };
    } catch (error) {
      console.error('Error sharing file:', error);
      return { success: false, message: 'Error al compartir el archivo' };
    }
  };

  return {
    isAndroid,
    downloadWeb,
    saveToDevice,
    shareFile,
  };
}
