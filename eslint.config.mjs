import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import prettierConfig from "eslint-config-prettier";

// Next 16 で `next lint` が廃止されたため、eslint を直接実行する構成に移行した。
// 以前は FlatCompat で next/core-web-vitals を extends していたが、
// eslint-plugin-react の設定に循環参照があり @eslint/eslintrc が JSON 化で
// クラッシュしていた（"Converting circular structure to JSON"）。
// FlatCompat を捨て、各プラグインが提供する flat config を直接使う。
const eslintConfig = [
  // flat config は .eslintignore を読まないので、無視対象をここで宣言する。
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "public/**",
      "content/**",
      "next-env.d.ts",
    ],
  },
  // Next.js の core-web-vitals（@next/next ルール群）
  nextPlugin.configs["core-web-vitals"],
  // React Hooks。従来 next/core-web-vitals が効かせていた2ルールに揃える。
  // react-hooks 7.x の recommended-latest は React Compiler 世代の新ルール
  // （static-components 等）を含み、既存コードに無関係な違反を大量に出すため使わない。
  {
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslintPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern:
            "^(mniData|cursorPosition|mniToAalTransform|forceUpdate|setForceUpdate|handleSliceChange)$",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      // アクセシビリティルール
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/img-redundant-alt": "error",
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
    },
  },
  {
    files: ["components/brain/BrainSliceViewer.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
  // prettier と競合する整形系ルールを最後に無効化する。
  prettierConfig,
];

export default eslintConfig;
