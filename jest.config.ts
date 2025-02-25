import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest", // Uses ts-jest for TypeScript support
  testEnvironment: "node", // Ensures tests run in a Node.js environment
  testMatch: ["**/__tests__/**/*.(test|spec).ts"], // Matches test files
  moduleFileExtensions: ["ts", "js"], // Recognized file extensions
  coverageDirectory: "coverage", // Stores test coverage reports
  collectCoverage: true, // Enables test coverage collection
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!types/**/*.d.ts"], // Excludes type definition files
};

export default config;
