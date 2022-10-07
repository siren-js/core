# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2022-10-07

### Added

- `stringify` and `parse` functions for generating and parsing Siren JSON

### Changed

- Object creation now done via static factory methods (e.g., `Entity.of({...})`)
- Validation is now done via [class-validator](https://github.com/typestack/class-validator)
- Renamed `Entity`'s and `Action`'s `get*` methods to `find*`

### Removed

- Query methods:
  - `Entity.prototype.getActionsByClass()`
  - `Entity.prototype.getEntitiesByClass()`
  - `Entity.prototype.getLinksByClass()`

## [0.3.2] - 2021-07-05

### Changed

- Explicitly mentioning cross-platform support in README

### Fixed

- [#9](https://github.com/siren-js/core/issues/9) - Mentioning minimum TypeScript version in README
- [#10](https://github.com/siren-js/core/issues/10) - Link relation types are now compared in a case-insensitive fashion, per [RFC 8288](https://datatracker.ietf.org/doc/html/rfc8288#section-3.3).

## [0.3.1] - 2021-04-26

### Changed

- Transpiling to CommonJS modules

## [0.3.0] - 2021-04-26

### Added

- Examples for using extensions
- Documentation for TypeScript limitations

### Changed

- Code is now written in TypeScript to more easily manage type declarations. The
  API has not changed, but the code now transpiles to ES2015, which may cause
  compatibility issues.

### Fixed

- [#6](https://github.com/siren-js/core/issues/6) - Extensions are now supported in TypeScript

## [0.2.0] - 2021-04-22

### Added

- Methods for looking up components:
  - `Action.prototype.getFieldByName()`
  - `Action.prototype.getFieldsByClass()`
  - `Entity.prototype.getActionByName()`
  - `Entity.prototype.getActionsByClass()`
  - `Entity.prototype.getEntitiesByClass()`
  - `Entity.prototype.getEntitiesByRel()`
  - `Entity.prototype.getLinksByClass()`
  - `Entity.prototype.getLinksByRel()`

### Fixed

- Serializing `EmbeddedEntity` now includes `rel`
- Generated type for `Entity.prototype.actions`
- [#4](https://github.com/siren-js/core/issues/4) - Type declarations for option objects

## [0.1.2] - 2021-04-09

### Added

- Contribution guidelines
- Code of conduct

### Fixed

- Corrected validation of `rel` in `EmbeddedLink`'s constructor; a `TypeError`
  is still thrown, but now includes a better message.
- `EmbeddedLink.isValid()` now returns `true` if `rel` is a string.

## [0.1.1] - 2021-04-02

### Added

- Component classes documented with [JSDoc](https://jsdoc.app)
- Type declarations for more IDE-friendly development

## [0.1.0] - 2021-03-26

### Added

- Included classes for representing Siren components (e.g., entity, action) with
  the following features:
  - Constructors accept required members as positional parameters and optional
    members as an options object.
  - Extensions are allowed via the options object.
  - Conformance to the core Siren specification is maintained through type
    coercion and, in some places, immutability.

[0.4.0]: https://github.com/siren-js/core/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.com/siren-js/core/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/siren-js/core/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/siren-js/core/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/siren-js/core/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/siren-js/core/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/siren-js/core/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/siren-js/core/releases/tag/v0.1.0
