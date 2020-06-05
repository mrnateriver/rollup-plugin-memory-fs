# Changelog

All notable changes to `rollup-plugin-memory-fs` will be documented in this file.

## [1.0.3] - 2020-06-05
### Fixed
- Fixed an error that occurred when `output.file` was being used instead of `output.dir` in Rollup configuration.
### Changed
- `reload` event is now emitted with an absolute path instead of just a filename.

## [1.0.2] - 2020-06-05
### Added
- Implemented EventEmitter functionality - now plugin emits `reload` event when bundle is rebuilt.

## [1.0.1] - 2020-05-31
### Fixed
- Added `types` directive to `package.json`.

## [1.0.0] - 2020-05-28
### Added
- Initial version.

[1.0.3]: https://github.com/mrnateriver/rollup-plugin-memory-fs/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/mrnateriver/rollup-plugin-memory-fs/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/mrnateriver/rollup-plugin-memory-fs/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/mrnateriver/rollup-plugin-memory-fs/releases
