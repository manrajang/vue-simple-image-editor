module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    "plugin:vue/essential",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint"
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    "no-console": "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off"
    // "vue/order-in-components": "error"
    // "vue/html-closing-bracket-spacing": "off",
    // "vue/no-v-html": "off",
    // "vue/require-prop-types": "off",
    // "vue/require-default-prop": "off",
    // "vue/attribute-hyphenation": "off",
    // "vue/singleline-html-element-content": "off",
    // "vue/singleline-html-element-content-newline": "off",
    // "vue/multiline-html-element-content-newline": "off",
    // "vue/html-self-closing": "off",
    // "vue/max-attributes-per-line": "off",
    // "yoda": "off",
    // "no-return-assign": "off",
    // "no-multi-spaces": "off",
    // "spaced-comment": "off",
    // "padded-blocks": "off",
    // "comma-dangle": "off",
    // "no-unused-vars": "off",
  }
};
