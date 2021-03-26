# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog][kac], and this project adheres to
[Semantic Versioning][semver].

[kac]: https://keepachangelog.com/en/1.0.0
[semver]: https://semver.org/spec/v2.0.0.html

## Unreleased

## 0.1.0

### Added

- Included classes for representing Siren components (e.g., entity, action) with
  the following features:
  - Constructors accept required members as positional parameters and optional
    members as an options object.
  - Extensions are allowed via the options object.
  - Conformance to the core Siren specification is maintained through type
    coercion and, in some places, immutability.
