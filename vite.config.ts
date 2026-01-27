import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/ventana_circadiana/", // 👈 este es el cambio necesario
});
