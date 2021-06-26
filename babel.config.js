// babel.config.js
module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript'],
  plugins: [
    [
      "module-resolver",
      {
        "root": ["./src"],
        "alias": {
          "@chillapi/builtin": "./delegate"
        }
      }
    ],
  ]
};