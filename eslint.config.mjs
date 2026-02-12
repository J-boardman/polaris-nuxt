// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";
import eslintConfigPrettier from "eslint-config-prettier";

export default withNuxt(
  {
    ignores: ["convex/_generated/**"],
  },
  {
    rules: {
      "vue/no-multiple-template-root": "off",
    },
  },
  eslintConfigPrettier,
);
