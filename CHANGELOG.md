# Changelog

All notable changes to Vantage LLM Sidebar will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-02-11

### Added

- **Kimi AI support** - Added Moonshot AI's Kimi as a new LLM option in the sidebar dropdown
- Added host permissions for `*.moonshot.cn` in manifest
- Added network rules for Kimi (rule #90) to enable iframe embedding
- Added Kimi domains to general header modification rules (#1 and #10)

### Fixed

- **Toggle functionality** - Keyboard shortcut (Ctrl+Space) now properly toggles the sidebar closed, not just opens it
  - Implemented state tracking per browser window
  - Sidebar now correctly closes when pressing Ctrl+Space while already open
  - Added cleanup for window state when browser windows are closed

### Changed

- Updated extension description to include Kimi in the list of supported LLMs
- Updated privacy policy to include Moonshot AI (Kimi) in third-party services
- Updated documentation to reflect Kimi support

## [1.0.0] - 2026-02-05

### Added

- Initial release of Vantage LLM Sidebar
- Support for ChatGPT, Claude, Gemini, Perplexity, DeepSeek, and Nano Banana (AI Studio)
- Glassmorphic sidebar design
- Global keyboard shortcut (Ctrl+Space / Cmd+Space)
- Network header modification to bypass iframe restrictions
- User preference persistence for selected LLM
- Comprehensive documentation suite (9 files, 50k+ words)
- Privacy-first approach (no data collection)

### Features

- Side panel integration
- Multi-LLM dropdown switcher
- Remembers last selected model
- Nuclear reset on installation for clean state
- Works on Chrome and Edge browsers
