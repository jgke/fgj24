import { defineConfig, loadEnv, Plugin } from "vite";

import { createHtmlPlugin } from "vite-plugin-html";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const basePath = env.BASE_URL || "/";
  const fmodPath = mode === "development" ? "vendor/fmod/fmodstudioL.js" : "vendor/fmod/fmodstudio.js";
  return {
    base: basePath,
    plugins: [
      createHtmlPlugin({
        minify: true,
        /**
         * Data that needs to be injected into the index.html ejs template
         */
        inject: {
          data: {
            injectFmod: `<script src="${basePath}${fmodPath}"></script>`,
          },
        },
      }),
    ],
  };
});
