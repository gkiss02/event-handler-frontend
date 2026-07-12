import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";


export default defineConfig(( ) => {
  

  return {
    plugins: [
      react(),
      checker({
        typescript: {
          tsconfigPath: "./tsconfig.app.json",
        },
      }),
    ],
  };
});