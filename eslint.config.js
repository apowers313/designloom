// ESLint configuration for designloom
// This config focuses on ERROR PREVENTION, not stylistic rules

import eslint from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    // ============================================
    // IGNORE PATTERNS
    // ============================================
    {
        ignores: [
            "**/dist/**",
            "**/node_modules/**",
            "**/coverage/**",
            "**/tmp/**",
            "**/*.config.js",
            "**/*.config.ts",
            "**/vitest.config.ts",
            // Tests are not in tsconfig (vitest handles them separately)
            "tests/**",
            // Browser frontend has separate tsconfig and React conventions
            "src/browser/frontend/**",
        ],
    },

    // ============================================
    // BASE JAVASCRIPT RULES
    // ============================================
    eslint.configs.recommended,

    // ============================================
    // JSDOC RULES FOR PUBLIC API DOCUMENTATION
    // ============================================
    jsdoc.configs["flat/recommended-typescript-error"],
    {
        plugins: {
            jsdoc,
        },
        rules: {
            "jsdoc/require-description": "error",
            "jsdoc/require-param-description": "error",
            "jsdoc/require-returns-description": "error",
            "jsdoc/no-types": "error",
            "jsdoc/check-tag-names": [
                "error",
                {
                    definedTags: ["since", "internal", "remarks"],
                },
            ],
            "jsdoc/require-jsdoc": [
                "error",
                {
                    publicOnly: true,
                    require: {
                        FunctionDeclaration: true,
                        MethodDefinition: true,
                        ClassDeclaration: true,
                    },
                },
            ],
        },
    },

    // ============================================
    // TYPESCRIPT STRICT RULES (for .ts/.tsx files)
    // ============================================
    {
        files: ["**/*.ts", "**/*.tsx"],
        extends: [...tseslint.configs.strictTypeChecked],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                ...globals.node,
                ...globals.es2022,
            },
        },
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            // ==========================================
            // ERROR PREVENTION - Type Safety
            // ==========================================
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/explicit-function-return-type": [
                "error",
                {
                    allowExpressions: true,
                    allowIIFEs: true,
                },
            ],
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/no-misused-promises": "error",
            "@typescript-eslint/await-thenable": "error",
            "@typescript-eslint/require-await": "error",
            "@typescript-eslint/no-unnecessary-type-assertion": "error",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/no-non-null-assertion": "error",
            "@typescript-eslint/no-unnecessary-condition": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/restrict-template-expressions": [
                "error",
                {
                    allowNumber: true,
                    allowBoolean: true,
                    allowAny: false,
                    allowNullish: false,
                },
            ],

            // ==========================================
            // ERROR PREVENTION - Logic Safety
            // ==========================================
            eqeqeq: ["error", "always"],
            curly: "error",
            "no-var": "error",
            "prefer-const": "error",
            "consistent-return": "error",
            "no-template-curly-in-string": "error",
            "no-else-return": "error",
            "no-nested-ternary": "error",
            "no-unneeded-ternary": "error",
            "prefer-template": "error",
            "dot-notation": "error",
            "default-case": "error",
            "default-param-last": "error",
            yoda: ["error", "never"],

            // ==========================================
            // CODE QUALITY
            // ==========================================
            "no-console": ["error", { allow: ["warn", "error"] }],
            "no-duplicate-imports": "error",
            "no-useless-constructor": "error",
            "no-useless-rename": "error",
            "no-useless-computed-key": "error",
            "prefer-destructuring": ["error", { object: true, array: false }],
            "prefer-rest-params": "error",
            "prefer-spread": "error",
            camelcase: ["error", { properties: "always" }],

            // ==========================================
            // IMPORT SORTING
            // ==========================================
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
        },
    },

    // ============================================
    // RELAXED RULES FOR TEST FILES
    // ============================================
    {
        files: [
            "**/*.test.ts",
            "**/*.test.tsx",
            "**/*.spec.ts",
            "**/*.spec.tsx",
            "**/tests/**/*.ts",
            "**/tests/**/*.tsx",
        ],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/unbound-method": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/no-deprecated": "off",
            "@typescript-eslint/no-confusing-void-expression": "off",
            "@typescript-eslint/restrict-plus-operands": "off",
            "@typescript-eslint/no-redundant-type-constituents": "off",
            "no-console": "off",
            "jsdoc/require-jsdoc": "off",
            "jsdoc/require-description": "off",
            "jsdoc/require-param": "off",
            "jsdoc/require-param-description": "off",
            "jsdoc/require-returns": "off",
            "jsdoc/require-returns-description": "off",
            "jsdoc/check-param-names": "off",
            "jsdoc/check-tag-names": "off",
            "jsdoc/tag-lines": "off",
        },
    },
);
