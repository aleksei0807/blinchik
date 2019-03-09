const path = require('path')

module.exports = {
  env: { browser: true, commonjs: true, node: true },
  extends: [
    'airbnb',
    'plugin:security/recommended',
  ],
  overrides: [
    {
      excludedFiles: 'node_modules/*',
      files: ['./*.js'],
    },
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['babel', 'import', 'security', 'jsx-a11y'],
  rules: {
    'array-bracket-spacing': [2, 'always'],
    'arrow-parens': 0,

    'babel/arrow-parens': 0,
    'babel/new-cap': [2, { capIsNew: false }],

    'comma-dangle': [2, {
      "arrays": "only-multiline",
      "objects": "only-multiline",
      "imports": "only-multiline",
      "exports": "only-multiline",
      "functions": "ignore",
    }],

    'object-curly-newline': 0,

    'generator-star-spacing': 0,
    'global-require': 0,

    'import/default': 2,
    'import/export': 2,
    'import/extensions': 0,
    'import/named': 2,
    'import/namespace': 2,
    'import/no-extraneous-dependencies': 0,
    'import/no-unresolved': [1, { amd: true, commonjs: true }],

    indent: [2, 2, { 'SwitchCase': 1 }],

    // jsx-a11y rules
    'jsx-a11y/accessible-emoji': 2,
    'jsx-a11y/alt-text': 2,
    'jsx-a11y/anchor-has-content': 2,
    'jsx-a11y/anchor-is-valid': [2, { 'components': [] }],
    'jsx-a11y/aria-activedescendant-has-tabindex': 2,
    'jsx-a11y/aria-props': 2,
    'jsx-a11y/aria-proptypes': 2,
    'jsx-a11y/aria-role': 2,
    'jsx-a11y/aria-unsupported-elements': 2,
    'jsx-a11y/click-events-have-key-events': 2,
    'jsx-a11y/heading-has-content': 2,
    'jsx-a11y/html-has-lang': 2,
    'jsx-a11y/iframe-has-title': 2,
    'jsx-a11y/img-redundant-alt': 2,
    'jsx-a11y/interactive-supports-focus': [
      2,
      {
        tabbable: [
          'button',
          'checkbox',
          'link',
          'progressbar',
          'searchbox',
          'slider',
          'spinbutton',
          'switch',
          'textbox',
        ],
      },
    ],
    'jsx-a11y/label-has-for': 2,
    'jsx-a11y/media-has-caption': 2,
    'jsx-a11y/mouse-events-have-key-events': 2,
    'jsx-a11y/no-access-key': 2,
    'jsx-a11y/no-autofocus': 2,
    'jsx-a11y/no-distracting-elements': 2,
    'jsx-a11y/no-interactive-element-to-noninteractive-role': 2,
    'jsx-a11y/no-noninteractive-element-interactions': 2,
    'jsx-a11y/no-noninteractive-element-to-interactive-role': 2,
    'jsx-a11y/no-noninteractive-tabindex': 2,
    'jsx-a11y/no-onchange': 2,
    'jsx-a11y/no-redundant-roles': 2,
    'jsx-a11y/no-static-element-interactions': 2,
    'jsx-a11y/role-has-required-aria-props': 2,
    'jsx-a11y/role-supports-aria-props': 2,
    'jsx-a11y/scope': 2,
    'jsx-a11y/tabindex-no-positive': 2,

    // end of jsx-a11y rules

    'new-cap': 0,
    'no-await-in-loop': 1,
    'no-console': 0,
    'no-mixed-operators': 0,
    'no-trailing-spaces': [2, { skipBlankLines: true }],
    'no-plusplus': 0,
    'security/detect-object-injection': 0,

    'generator-star-spacing': 1,

    'object-curly-spacing': [2, 'always'],
    'object-shorthand': [2, 'always'],

    'react/jsx-closing-bracket-location': 2,
    'react/jsx-indent': [2, 2],
    'react/jsx-indent-props': [2, 2],
    'react/jsx-pascal-case': 2,
    'react/prefer-stateless-function': 0,
    'react/prop-types': 1,
    'react/forbid-prop-types': 0,
    'react/require-optimization': 1,
    'react/require-optimization': 0,
    'react/require-default-props': 0,

    semi: [2, 'never'],
    // 'sort-keys': [ 1, 'asc', { caseSensitive: false, natural: true } ],
    'sort-vars': 1,
  },
  settings: {
    'import/extensions': ['.jsx', '.js'],
  }
}
