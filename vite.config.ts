import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig, loadEnv} from 'vite';
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      obfuscatorPlugin({
        include: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
        exclude: [/node_modules/],
        apply: 'build',
        debugger: false,
        options: {
          compact: true,
          controlFlowFlattening: false,
          deadCodeInjection: false,
          debugProtection: false,
          disableConsoleOutput: false,
          stringArray: true,
          stringArrayEncoding: [], // Removed base64 encoding — adds runtime decode overhead
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'node-fetch': path.resolve(__dirname, 'src/node-fetch-shim.ts'),
        'cross-fetch': path.resolve(__dirname, 'src/node-fetch-shim.ts'),
        'isomorphic-fetch': path.resolve(__dirname, 'src/node-fetch-shim.ts'),
        'formdata-polyfill': path.resolve(__dirname, 'src/empty-module.ts'),
      },
    },
    build: {
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-motion': ['motion/react'],
            'vendor-color': ['react-colorful'],
            'vendor-gif': ['gif.js'],
          }
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      host: true,
      watch: {
        ignored: ['**/APK_VERSOES/**', '**/android/**', '**/dist/**', '**/temp_extracted_apk/**']
      }
    },
  };
});
