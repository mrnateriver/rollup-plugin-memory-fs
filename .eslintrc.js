module.exports = {
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    env: {
        es6: true,
        browser: false,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:prettier/recommended', // Recommended general formatting rules
    ],
};
