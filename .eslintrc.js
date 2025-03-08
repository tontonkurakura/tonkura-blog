module.exports = {
  extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        varsIgnorePattern:
          "^(mniData|cursorPosition|mniToAalTransform|forceUpdate|setForceUpdate|handleSliceChange)$",
      },
    ],
    "react-hooks/exhaustive-deps": "warn",
  },
  overrides: [
    {
      files: ["components/brain/BrainSliceViewer.tsx"],
      rules: {
        "@typescript-eslint/no-unused-vars": "off",
        "react-hooks/exhaustive-deps": "off",
      },
    },
  ],
  ignorePatterns: [
    ".next/*",
    "node_modules/*",
    "public/*",
    "styles/*",
    "coverage/*",
    "dist/*",
    ".eslintrc.js",
  ],
};
