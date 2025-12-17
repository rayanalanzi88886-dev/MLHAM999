import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'import.meta.env.VITE_ANTHROPIC_API_KEY': JSON.stringify(env.VITE_ANTHROPIC_API_KEY),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'import.meta.env.VITE_BACKUP_API_KEY': JSON.stringify(env.VITE_BACKUP_API_KEY),
        'import.meta.env.VITE_BACKUP_API_URL': JSON.stringify(env.VITE_BACKUP_API_URL),
        'import.meta.env.VITE_TOGETHER_API_KEY': JSON.stringify(env.VITE_TOGETHER_API_KEY),
        'import.meta.env.VITE_TOGETHER_MODEL_ID': JSON.stringify(env.VITE_TOGETHER_MODEL_ID),
        'import.meta.env.VITE_TOGETHER_FALLBACK_MODEL': JSON.stringify(env.VITE_TOGETHER_FALLBACK_MODEL),
        'import.meta.env.VITE_GOOGLE_API_KEY': JSON.stringify(env.VITE_GOOGLE_API_KEY),
        'import.meta.env.VITE_GOOGLE_CX': JSON.stringify(env.VITE_GOOGLE_CX),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
