// @ts-check

import betterTailwindcss from "eslint-plugin-better-tailwindcss";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  betterTailwindcss.configs["recommended"],
  {
    rules: {
      "better-tailwindcss/enforce-consistent-line-wrapping": "off",
    },
  },
];

export default config;
