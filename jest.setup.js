// テスト環境のグローバル設定
import "@testing-library/jest-dom";

// モックの設定
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "",
      query: {},
      asPath: "",
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// 環境変数のモック
process.env = {
  ...process.env,
  NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
};
