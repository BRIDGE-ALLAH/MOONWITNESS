import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: { port: 5280, strictPort: true },
  build: { target: "es2020", outDir: "dist", emptyOutDir: true },
})

