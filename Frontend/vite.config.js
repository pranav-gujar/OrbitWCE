import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 5173,
    open: true
  },
  esbuild: {
    // Remove the jsx option from the React plugin and set it in esbuild config
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  }
});
