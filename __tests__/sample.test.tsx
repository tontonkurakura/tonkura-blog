import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// サンプルコンポーネント
const SampleComponent = ({ text }: { text: string }) => {
  return <div>{text}</div>;
};

describe("サンプルテスト", () => {
  it("コンポーネントが正しくレンダリングされること", () => {
    const testText = "テストテキスト";
    render(<SampleComponent text={testText} />);

    // テキストが表示されていることを確認
    expect(screen.getByText(testText)).toBeInTheDocument();
  });

  it("基本的な算術演算が正しく動作すること", () => {
    expect(1 + 1).toBe(2);
    expect(2 * 3).toBe(6);
    expect(10 - 5).toBe(5);
  });
});
