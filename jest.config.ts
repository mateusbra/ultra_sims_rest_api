import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.spec.ts"],
  clearMocks: true,
  setupFiles: ["<rootDir>/src/tests/env.setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
};

export default config;