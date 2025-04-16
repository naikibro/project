import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["/node_modules/", "/e2e/"],
  moduleNameMapper: {
    "src/(.*)": "<rootDir>/src/$1",
  },
  reporters: [
    "default",
    ["jest-html-reporter", { outputPath: "test-report.html" }],
  ],
};

export default createJestConfig(config);
