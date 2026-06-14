import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    ...devices["iPhone 13"],
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium-mobile",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
      },
    },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
