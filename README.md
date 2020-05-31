# Rollup plugin for storing build artifacts in memory

<a href="LICENSE">
  <img src="https://img.shields.io/badge/license-MIT-brightgreen.svg" alt="Software License" />
</a>
<a href="https://github.com/mrnateriver/rollup-plugin-memory-fs/issues">
  <img src="https://img.shields.io/github/issues/mrnateriver/rollup-plugin-memory-fs.svg" alt="Issues" />
</a>
<a href="https://npmjs.org/package/rollup-plugin-memory-fs">
  <img src="https://img.shields.io/npm/v/rollup-plugin-memory-fs.svg?style=flat-squar" alt="NPM" />
</a>
<a href="https://github.com/mrnateriver/rollup-plugin-memory-fs/releases">
  <img src="https://img.shields.io/github/release/mrnateriver/rollup-plugin-memory-fs.svg" alt="Latest Version" />
</a>

Quite obviously, this plugin is intended for use during development in watch mode with HTTP-server (for example, using [rollup-plugin-serve](https://github.com/thgh/rollup-plugin-serve)).

## Installation
```
# yarn
yarn add -D rollup-plugin-memory-fs

# npm
npm install --save-dev rollup-plugin-memory-fs
```

## Usage
```js
// rollup.config.js
import memfs from 'rollup-plugin-memory-fs'

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: ...
  },
  plugins: [
    memfs()
  ]
}
```

## Caveats

This plugin works by monkey-patching native Node.js module `fs` with `memfs`. This approach allows for transparent compatibility with any other plugin, and with Rollup itself. However, this imposes some limitations on overall Rollup workflow:
 1. Most importantly, any plugins that tightly depend on native filesystem will not work, most notably those relying on `fsevents` Node.js module (for example, [rollup-plugin-livereload](https://github.com/thgh/rollup-plugin-livereload));
 2. Any data written to FS in Rollup process will end up in memory, and thus will be lost on exit. Bear that in mind if you have any custom code executing during builds.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing

Contributions and feedback are more than welcome.

To get it running:
  1. Clone the project;
  2. `npm install`;
  3. `npm run build`.

## Credits

- [Evgenii Dobrovidov](https://github.com/mrnateriver);
- [All Contributors][link-contributors].

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

[link-author]: https://github.com/mrnateriver
[link-contributors]: ../../contributors
[rollup-plugin-memory-fs]: https://www.npmjs.com/package/rollup-plugin-memory-fs
