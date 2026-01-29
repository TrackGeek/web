import { tailwindcss } from "@bunup/plugin-tailwindcss";
import { defineConfig } from "bunup";

export default defineConfig({
  plugins: [
    tailwindcss({
      inject: true,
    }),
  ],
  entry: 'src/main.tsx',
});
