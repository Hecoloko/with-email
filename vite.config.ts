import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third parameter ('') loads all env variables, regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    // Define `process.env` to make environment variables available in the client-side code.
    // This is the standard way to expose variables to a Vite-built app while using
    // the `process.env` syntax in the source code, as required by the Gemini API guidelines.
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});
