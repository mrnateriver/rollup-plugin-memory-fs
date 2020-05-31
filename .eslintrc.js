module.exports = {
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    env: {
        browser: false,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:prettier/recommended', // Recommended general formatting rules
    ],
};
