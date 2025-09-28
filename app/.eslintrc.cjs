module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true
  },
  globals: {
    WheelEvent: 'readonly',
    TouchEvent: 'readonly',
    TouchList: 'readonly',
    MouseEvent: 'readonly',
    Event: 'readonly',
    TextEncoder: 'readonly',
    TextDecoder: 'readonly'
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
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
    extraFileExtensions: ['.vue'],
  },
  plugins: [
    'vue',
    '@typescript-eslint'
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-undef': 'off', // TypeScript handles this better than ESLint
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
    '*.d.ts'
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '**/*.test.ts', 'src/test/**/*.ts'],
      rules: {
        'no-undef': 'off'
      },
      env: {
        browser: true
      },
      globals: {
        WheelEvent: 'readonly',
        TouchEvent: 'readonly',
        TouchList: 'readonly',
        MouseEvent: 'readonly',
        Event: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly'
      }
    }
  ]
}