# Changelog

All notable changes to this project will be documented in this file.

## [v0.1.0] - 2026-01-09
### Added
- **Game Configuration**: `src/config/GameConfig.ts` with responsive scale settings (FIT mode).
- **Scene Management**:
    - `StartScene`: Preloader with progress bar, Title text, and "Start Game" button.
    - `MainScene`: Placeholder for core game loop with "Back" button.
- **Input System**: Basic pointer interaction enabled for buttons.
- **Entry Point**: Updated `src/main.ts` to load config and scenes.

## [v0.0.0] - 2026-01-09
### Added
- **Project Setup**: Initialized Vite + TypeScript project.
- **Dependencies**: Installed Phaser 3, gh-pages.
- **Infrastructure**:
    - Directory structure (`public/`, `src/`, etc.).
    - GitHub Actions workflow (`deploy.yml`).
    - PWA configuration (Manifest, Service Worker generator).
