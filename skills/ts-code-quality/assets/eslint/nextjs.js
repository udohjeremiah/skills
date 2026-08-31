// @ts-check

import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { globalIgnores } from "eslint/config";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "**/layout.{js,jsx,tsx}",
      "**/template.{js,jsx,tsx}",
      "**/error.{js,jsx,tsx}",
      "**/loading.{js,jsx,tsx}",
      "**/not-found.{js,jsx,tsx}",
      "**/page.{js,jsx,tsx}",
      "**/global-error.{js,jsx,tsx}",
      "**/default.{js,jsx,tsx}",
      "**/middleware.{js,jsx,ts,tsx}",
      "**/proxy.{js,jsx,ts,tsx}",
      "next.config.*",
      "eslint.config.*",
    ],
    rules: {
      "import-x/no-default-export": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
];

export default config;
