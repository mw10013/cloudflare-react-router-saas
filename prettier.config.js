/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  // https://github.com/IanVS/prettier-plugin-sort-imports
  importOrder: [
    "<TYPES>^(node:)",
    "<TYPES>",
    "<TYPES>^[.]",
    "^(react/(.*)$)|^(react$)",
    "<THIRD_PARTY_MODULES>",
    "^~/(.*)$",
    "^[./]",
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderTypeScriptVersion: "5.8.2",

  // https://github.com/tailwindlabs/prettier-plugin-tailwindcss?tab=readme-ov-file#sorting-classes-in-function-calls
  // https://github.com/tailwindlabs/prettier-plugin-tailwindcss?tab=readme-ov-file#sorting-classes-in-template-literals
  tailwindFunctions: [
    "tw",
    "twMerge",
    "twJoin",
    "composeTailwindRenderProps",
    "cva",
    "cn",
  ],

  plugins: [
    "prettier-plugin-sql",
    "@ianvs/prettier-plugin-sort-imports",
    // https://github.com/tailwindlabs/prettier-plugin-tailwindcss?tab=readme-ov-file#compatibility-with-other-prettier-plugins
    "prettier-plugin-tailwindcss", // MUST come last
  ],
  overrides: [
    {
      files: ["*.sql"],
      // https://github.com/un-ts/prettier/tree/master/packages/sql#parser-options
      options: {
        language: "sqlite",
        keywordCase: "lower",
      },
    },
    // https://github.com/tailwindlabs/prettier-plugin-tailwindcss/issues/281
    {
      files: ["./functions/o/**"],
      options: {
        tailwindStylesheet: "./functions/o/app/app.css",
      },
    },
    {
      files: ["./functions/oui/**"], // Files within the oui library project
      options: {
        // For Tailwind v4, specify a representative stylesheet
        // Using project 'o's stylesheet as context for oui's own source files
        tailwindStylesheet: "./functions/o/app/app.css",
      },
    },
    {
      files: ["./functions/s/**"],
      options: {
        tailwindStylesheet: "./functions/s/app/app.css",
      },
    },
    {
      files: ["./functions/x/**"],
      options: {
        tailwindStylesheet: "./functions/x/app/app.css",
      },
    },
    {
      files: ["*.jsonc"],
      options: {
        trailingComma: "none",
      },
    },
  ],
};

export default config;
