import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom to simulate a browser environment for React component tests
    environment: "jsdom",
    globals: true,
    setupFiles: ["tests/vitest.setup.js"],
    // Separate reporters for readable terminal output
    reporters: ["verbose"],
    // Coverage settings — run with: npm run test:coverage
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/main.jsx"],
      // Minimum thresholds — CI will fail if these drop
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
    // AI prompt tests make real API calls — skip them unless explicitly enabled
    // Run with: ENABLE_AI_TESTS=true npm run test:ai
    include: ["**/*.test.{js,jsx}"],
  },
});
