# VELTRIX Launcher Source Rebuild Design

## Scope

This design covers the first implementation phase of the larger VELTRIX update: replacing the current patch-assembled launcher pipeline with a normal, maintainable Java source project while preserving the working VELTRIX 0.8.2 behavior as the compatibility baseline.

The website, Modrinth/CurseForge browser, shader subsystem, performance subsystem, full multi-version adapter system, and redesigned settings/log UI remain later phases. This phase establishes the source architecture they require.

## Current State

The repository currently publishes VELTRIX 0.8.2 for Windows and builds the native installer with Java 21 and `jpackage`.

The launcher itself is not rebuilt from normal Java source in the repository. The Windows workflow reconstructs the 0.8.2 launcher JAR from the older 0.8.0 packaged JAR plus Base64-encoded patch archives, then validates selected classes and packages the result.

That pipeline must remain available temporarily as a regression/reference path until the source-built launcher reaches feature parity.

## Primary Goal

Create a conventional Java 21 launcher source project inside the existing repository that:

- builds reproducibly from source;
- starts as a desktop VELTRIX launcher;
- preserves the existing VELTRIX branding and Windows packaging path;
- exposes clean module boundaries for authentication, Minecraft launch coordination, settings, logging, updates, and future integrations;
- does not depend on Base64 class patches for normal development;
- can be tested independently before replacing the current 0.8.2 release path.

## Non-Goals for This Phase

This phase does not claim to finish the entire master update.

It will not yet implement the complete versions of:

- Modrinth installation;
- CurseForge installation;
- VELTRIX Zoom;
- VELTRIX Shader Loader;
- VELTRIX Performance;
- all historical and future Minecraft version adapters;
- final website redesign;
- final crash analyzer;
- final Microsoft/Xbox/Minecraft authentication exchange.

However, the source architecture must provide stable interfaces for these later phases.

## Architectural Approach

Use a Gradle-based Java 21 project under `launcher/`.

The launcher will stay a Java desktop application so the existing `jpackage` Windows installer strategy can be retained. The exact UI toolkit should follow the existing launcher behavior where practical; the initial rebuild should prioritize compatibility and maintainability over a visual rewrite.

The project is split by responsibility rather than by one large application class.

Proposed structure:

```text
launcher/
  build.gradle
  settings.gradle
  src/main/java/dev/veltrix/launcher/
    VeltrixLauncher.java
    VeltrixLauncherApp.java
    config/
    auth/
    launch/
    logs/
    update/
    ui/
    platform/
  src/main/resources/
  src/test/java/dev/veltrix/launcher/
```

The final structure may adjust slightly if repository inspection exposes a stronger existing convention, but responsibilities must remain separated.

## Core Components

### 1. Application Bootstrap

`VeltrixLauncher` is the executable entry point.

Responsibilities:

- install a global uncaught exception handler;
- initialize the launcher data directory;
- initialize file logging;
- load configuration safely;
- construct application services;
- start the UI;
- support a non-UI diagnostic mode for CI.

A malformed user configuration must not prevent startup. The launcher records a warning and falls back to safe defaults.

### 2. Configuration Service

A dedicated configuration component owns persisted launcher settings.

Requirements:

- UTF-8 or Java properties-based persistence with explicit validation;
- safe defaults;
- atomic writes using temporary file + move where supported;
- corrupt entries do not crash startup;
- no Microsoft access tokens, refresh tokens, API keys, or passwords stored in the regular settings file;
- versioned configuration model so migrations can be added later.

### 3. Logging and Startup Diagnostics

A launcher log service writes startup and runtime events beneath the VELTRIX application data directory.

On Windows, the existing `%LOCALAPPDATA%` behavior is retained.

At minimum the rebuild must preserve equivalents of:

- launcher startup log;
- startup error log;
- global uncaught exception diagnostics;
- `--diagnose` command-line mode.

Sensitive values must be redacted before writing logs.

### 4. Authentication Boundary

Create an `AuthenticationService` interface and Microsoft-oriented implementation boundary without hard-coding secrets.

This phase provides the source interfaces, account model, state handling, and browser/callback abstraction needed by the later real Microsoft OAuth 2.0 Authorization Code + PKCE implementation.

No password collection, client-secret embedding, or authentication bypass is allowed.

If required Microsoft application configuration is missing, the launcher must surface an explicit configuration error instead of fabricating credentials.

### 5. Minecraft Launch Boundary

Create a `MinecraftLaunchCoordinator` boundary responsible for validating a launch request and starting a Minecraft process.

The first source rebuild may initially preserve only the already supported launch behavior, but the coordinator must isolate:

- account/session data;
- selected Minecraft profile/version;
- Java runtime selection;
- JVM arguments;
- game arguments;
- instance directory;
- process stdout/stderr capture.

Later multi-version support must not require UI code to construct raw Java command lines.

### 6. UI Boundary

Recreate enough of the existing 0.8.2 launcher UI to provide behavioral parity before introducing the larger design rewrite.

UI classes must depend on services/interfaces rather than implementing network, authentication, or launch logic directly.

Initial major views:

- main launcher shell;
- play view;
- account dialog/view;
- right rail/status area;
- settings entry point;
- error dialog capable of opening logs.

Visual redesign belongs to a later phase after the source-built launcher is stable.

### 7. Platform Services

Platform-specific behavior is isolated behind interfaces.

Examples:

- application data directory discovery;
- opening folders/URLs;
- credential storage integration in later phases;
- OS detection.

Do not scatter direct Windows-specific paths through UI classes.

## Build System

Use Gradle with a pinned wrapper committed to the repository.

Requirements:

- Java toolchain 21;
- reproducible JAR build;
- JUnit 5 tests;
- test command usable on GitHub Actions;
- runnable launcher task for local development;
- manifest/main-class configuration;
- no source-time secrets.

The repository must be able to run:

```text
./gradlew test
./gradlew build
```

On Windows the equivalent wrapper command is used.

## Migration Strategy

The current 0.8.2 patch-based installer is not deleted during the first rebuild.

Migration steps:

1. add the source project alongside the old reconstruction pipeline;
2. build and test the source launcher in CI;
3. add parity tests for known startup contracts;
4. package the source-built JAR with `jpackage` in a separate workflow/job;
5. validate native startup;
6. only after parity is demonstrated, switch the production installer workflow from reconstructed JAR to source-built JAR;
7. retain the old patch assets for one release cycle or archive them in repository history, then remove them in a dedicated cleanup change.

This avoids breaking the current working Windows release while reconstruction is underway.

## Compatibility Baseline

VELTRIX 0.8.2 is the behavioral baseline for this phase.

Known contracts that must remain true:

- Java 21 packaging;
- native Windows installer generation through `jpackage`;
- application can start without an externally installed Java runtime because the packaged runtime is included;
- `%LOCALAPPDATA%`-based startup diagnostics on Windows;
- launcher configuration corruption does not hard-crash startup;
- diagnostic mode exits successfully when the launcher environment is valid;
- Windows installer includes normal shortcut/menu/uninstall behavior.

## Security Constraints

The rebuild must not introduce:

- plaintext account passwords;
- embedded Microsoft client secrets;
- access/refresh tokens in normal logs;
- arbitrary shell command construction from untrusted strings;
- downloads executed without validation;
- remote code fetched and executed during startup without integrity checks.

Secrets required for future services must be supplied through secure external configuration and not committed to Git.

## Error Handling

The launcher must distinguish recoverable user/environment errors from internal failures.

Examples:

- corrupted settings -> warn, recover with defaults;
- missing external authentication configuration -> explanatory error;
- Java/Minecraft launch failure -> record process diagnostics and show a user-readable message;
- unexpected exception -> write startup/runtime error log and show a fallback error UI where possible.

The application must not fail with a blank/white window when an exception can be caught at the application boundary.

## Testing Strategy

### Unit Tests

At minimum:

- configuration defaults;
- corrupt persisted configuration recovery;
- atomic configuration save/load round trip;
- sensitive log redaction;
- platform path resolution abstraction;
- launch request validation;
- authentication state model transitions.

### Integration Tests

At minimum:

- `--diagnose` starts without UI and returns success;
- application bootstrap can initialize services using a temporary VELTRIX data directory;
- launcher logs are created in the configured data directory;
- packaged JAR contains the expected entry point and resources.

### CI Packaging Test

Windows Actions should:

- run Gradle tests;
- build the launcher JAR from source;
- inspect the JAR/main class;
- package with `jpackage`;
- install or unpack as appropriate for CI;
- launch diagnostic/native startup verification;
- fail the release job if startup validation fails.

## Repository Changes in This Phase

Expected new/changed areas:

```text
launcher/**
.github/workflows/build-launcher-source.yml
.github/workflows/build-windows-installer.yml
README.md
docs/superpowers/**
```

The existing website files remain functionally unchanged except for documentation/version references if needed.

## Versioning

Do not publish an arbitrary new stable major version as soon as source code exists.

During migration, source builds should use a development identifier such as `0.9.0-dev` or another repository-consistent pre-release value.

The stable public download remains 0.8.2 until the source-built launcher passes the required parity/release checks.

## Follow-on Phases

Once this phase is stable, the larger master update proceeds as separate specs/plans:

1. Microsoft/Xbox/Minecraft authentication with PKCE and secure token storage;
2. Minecraft instance/version/loader architecture;
3. Modrinth and CurseForge integration;
4. VELTRIX system addon framework + Zoom;
5. shader compatibility layer and safe mode;
6. performance module;
7. modern settings, logs, crash analyzer, diagnostics;
8. final launcher visual redesign;
9. website redesign using real launcher screenshots and platform branding;
10. macOS/Linux packaging after actual platform verification.

## Definition of Done for This Phase

This phase is complete only when:

- normal Java source for the launcher exists in the repository;
- the source project builds with the Gradle wrapper;
- automated tests pass;
- diagnostic mode passes from the source-built JAR;
- a separate CI path produces a native Windows package from the source-built JAR;
- the new architecture has explicit boundaries for auth, launching, config, logging, UI, and platform services;
- no committed secret is required to build/test it;
- the existing 0.8.2 production path has not been broken during migration;
- production is switched only after source-build parity is verified.
