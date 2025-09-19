module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: {
      'ts': require.resolve('@typescript-eslint/parser'),
      '<template>': 'espree'
    },
    ecmaVersion: 2022,
    sourceType: 'module',
    extraFileExtensions: ['.vue']
  },
  plugins: [
    'vue'
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
    'no-unused-vars': 'error',
    'vue/attribute-hyphenation': 'error',
    'vue/component-definition-name-casing': 'error',
    'vue/first-attribute-linebreak': 'error',
    'vue/html-closing-bracket-newline': 'error',
    'vue/html-closing-bracket-spacing': 'error',
    'vue/html-indent': ['error', 2],
    'vue/html-quotes': ['error', 'double'],
    'vue/max-attributes-per-line': ['error', { singleline: 3 }],
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never']
  },
  ignorePatterns: [
    'dist/**',
    'node_modules/**',
    '*.d.ts',
    '*.ts',
    '*.tsx'
  ]
}