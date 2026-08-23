import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Ta flaga wyłącza ostrzeżenia o @import i czyści logi Rendera
        silenceDeprecations: ['import', 'global-builtin'],
      },
    },
  },
});
