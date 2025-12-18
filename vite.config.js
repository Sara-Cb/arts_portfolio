import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// export come funzione: per calcolare un BUILD_TIME a ogni avvio/build
export default defineConfig(({ mode }) => {
  // timestamp per cache-busting (disponibile in codice come __BUILD_TIME__)
  const BUILD_TIME = Date.now();

  return {
    // base: process.env.VITE_BASE || '/',

    plugins: [vue(), vueDevTools()],

    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },

    define: {
      __BUILD_TIME__: JSON.stringify(BUILD_TIME),
    },
  };
});
