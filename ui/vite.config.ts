import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/static/global.scss";`
      }
    }
  },
  resolve: {
    alias: {
      vue: "@vue/compat",
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@server": path.resolve(__dirname, "path/to/server"),
    },
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          compatConfig: {
            MODE: 2,
          },
        },
      },
    }),
    svgLoader({
      svgoConfig: { multipass: true },
      defaultImport: "component",
    }),
  ],

  server: {
    port: 8170,
    proxy: {
      "^/api": {
        target: "http://127.0.0.1:8171",
        changeOrigin: true, 
        secure: false,
      },
      
      "/socket.io/": {
        target: "http://127.0.0.1:8171",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
