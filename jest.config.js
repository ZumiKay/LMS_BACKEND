module.exports = {
  preset: "ts-jest",
  testEnvironment: "node", // Since we are testing an Express app
  verbose: true,
  moduleFileExtensions: ["ts", "js", "json", "node"],
  transform: {
    "^.+\\.ts?$": "ts-jest", // Use ts-jest for transforming TypeScript files
  },
  testMatch: ["**/__tests__/**/*.test.(ts|js)"], // Test files pattern
};
