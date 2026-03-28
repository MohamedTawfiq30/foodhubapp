import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

import { miaodaDevPlugin } from 'miaoda-sc-plugin';

// Miaoda IDE injects a custom Supabase fetch shim. Outside that environment it often causes
// "Failed to fetch" for real Supabase auth. Enable only when explicitly requested.
const useMiaodaDev =
  process.env.VITE_MIAODA_DEV === 'true' || process.env.MIAODA_DEV === 'true';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: 'named',
        namedExport: 'ReactComponent',
      },
    }),
    ...(useMiaodaDev ? [miaodaDevPlugin()] : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
