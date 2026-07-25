import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // i18n mandate (guides/50_CANONICAL_DECISIONS.md §1.5): zero hardcoded UI
  // strings. Every user-facing string comes from messages/*.json via next-intl.
  // Decision documented in AGENTS.md ("i18n enforcement").
  // - ignoreProps: non-visible props (ids, hrefs, classNames) are not copy.
  // - Vendored third-party components (shadcn ui/, ReactBits motion files) are
  //   excluded; our own code wrapping them must still pass.
  {
    files: ["app/**/*.tsx", "components/**/*.tsx", "features/**/*.tsx"],
    ignores: [
      "components/ui/**",
      "components/motion/blur-text.tsx",
      "components/motion/aurora.tsx",
    ],
    rules: {
      "react/jsx-no-literals": [
        "error",
        {
          noStrings: true,
          ignoreProps: true,
          noAttributeStrings: false,
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
