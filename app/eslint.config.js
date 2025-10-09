import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  // Global ignores
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '**/*.d.ts',
      'coverage/**',
      '.vite/**',
      'public/sw-bundle.js' // Generated Service Worker bundle
    ]
  },

  // Base ESLint recommended rules
  js.configs.recommended,

  // Vue 3 configuration
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: typescriptParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue']
      },
      globals: {
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        File: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        SVGElement: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        WheelEvent: 'readonly',
        TouchEvent: 'readonly',
        TouchList: 'readonly',
        Event: 'readonly',
        Image: 'readonly',
        XMLSerializer: 'readonly',
        DOMParser: 'readonly',
        global: 'readonly',
        console: 'readonly'
      }
    },
    plugins: {
      vue
    },
    rules: {
      ...vue.configs['vue3-recommended'].rules,

      // Vue-specific rules
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off', // Allow v-html for SVG content rendering
      'vue/no-unused-vars': 'error',
      'vue/component-tags-order': ['error', {
        order: ['template', 'script', 'style']
      }],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/attribute-hyphenation': ['error', 'never'],
      'vue/v-on-event-hyphenation': ['error', 'never'],

      // Disable console in production
      'no-console': 'error',
      'no-debugger': 'error'
    }
  },

  // TypeScript configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        console: 'readonly',
        File: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        SVGElement: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        WheelEvent: 'readonly',
        TouchEvent: 'readonly',
        TouchList: 'readonly',
        Event: 'readonly',
        Image: 'readonly',
        XMLSerializer: 'readonly',
        DOMParser: 'readonly',
        global: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      ...typescript.configs.recommended.rules,

      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-inferrable-types': 'error',

      // Import/export rules
      'no-duplicate-imports': 'error',

      // Code quality rules
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',

      // Production safety
      'no-console': 'error',
      'no-debugger': 'error',
      'no-alert': 'error'
    }
  },

  // Configuration files
  {
    files: ['**/*.config.js', '**/*.config.ts', 'vite.config.*'],
    rules: {
      'no-console': 'off' // Allow console in config files
    }
  },

  // Development and test files
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**', '**/test/**'],
    rules: {
      'no-console': 'off', // Allow console in tests
      '@typescript-eslint/no-explicit-any': 'off' // Allow any in tests
    }
  },

  // Logger utility exception
  {
    files: ['**/utils/logger.ts'],
    rules: {
      'no-console': 'off', // Logger utility needs console access
      '@typescript-eslint/no-explicit-any': 'off' // Logger can use any for flexibility
    }
  }
]