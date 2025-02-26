const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // next.config.jsとテスト環境用の.envファイルが配置されたディレクトリへのパス
  dir: "./",
});

// Jestに渡すカスタム設定
const customJestConfig = {
  // テストファイルのパターンを指定
  testMatch: ["**/__tests__/**/*.test.(ts|tsx|js|jsx)"],
  // テスト環境を指定
  testEnvironment: "jest-environment-jsdom",
  // セットアップファイルを指定
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  // モックディレクトリを指定
  moduleNameMapper: {
    // エイリアスの設定
    "^@/(.*)$": "<rootDir>/$1",
  },
  // カバレッジの設定
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "utils/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  // テスト対象から除外するファイル
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/coverage/",
  ],
};

// createJestConfigを使用して、Next.jsの設定を反映したJest設定を作成
module.exports = createJestConfig(customJestConfig);
