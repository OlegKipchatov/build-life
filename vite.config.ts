import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [react(), tailwindcss()], base: './',build:{rollupOptions:{output:{manualChunks:{react:['react','react-dom'],router:['@tanstack/react-router'],heroui:['@heroui/react']}}}} });
