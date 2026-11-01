const {
    defineConfig,
} = require("eslint/config");

const tsParser = require("@typescript-eslint/parser");
const globals = require("globals");
const jest = require("eslint-plugin-jest");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    settings: {
        cache: true,
    },

    languageOptions: {
        parser: tsParser,

        globals: {
            ...globals.node,
            ...jest.environments.globals.globals,
        },
    },

    plugins: {
        jest,
        "@typescript-eslint": typescriptEslint,
    },

    extends: compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
    ),

    rules: {
        "@typescript-eslint/explicit-function-return-type": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/no-non-null-assertion": 1,
        "@typescript-eslint/ban-ts-ignore": "off",
        "@typescript-eslint/no-var-requires": 0,
        "@typescript-eslint/no-use-before-define": 0,
        "@typescript-eslint/no-inferrable-types": "off",
        "no-prototype-builtins": 0,
        "require-atomic-updates": 0,
    },
}]);
