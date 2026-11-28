import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { portfolioPages } from "./scripts/portfolio-pages";

export default defineConfig({
  appType: "mpa",
  plugins: [react(), portfolioPages()],
});
