module.exports = {
  roots: ["<rootDir>/src"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/mocks/**",
  ],
  coveragePathIgnorePatterns: [],
  // setupFilesAfterEnv: ["./config/jest/setupTests.js"],
  setupFilesAfterEnv: ["jest-expect-message"],
  modulePaths: ["<rootDir>/src"],
  transform: {
    "^.+\\.(ts|js|tsx|jsx)$": "@swc/jest",
    // "^.+\\.css$": "<rootDir>/config/jest/cssTransform.js",
    // "^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)":
    //   "<rootDir>/config/jest/fileTransform.js",
  },
  testEnvironment: "jsdom",
  transformIgnorePatterns: [
    "[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  modulePaths: ["<rootDir>/src"],

  moduleFileExtensions: [
    // Place tsx and ts to beginning as suggestion from Jest team
    // https://jestjs.io/docs/configuration#modulefileextensions-arraystring
    "tsx",
    "ts",
    "web.js",
    "js",
    "web.ts",
    "web.tsx",
    "json",
    "web.jsx",
    "jsx",
    "node",
  ],
  watchPlugins: [
    // "jest-watch-typeahead/filename",
    // "jest-watch-typeahead/testname",
  ],
  resetMocks: true,
};
