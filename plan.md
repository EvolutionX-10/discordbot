# Plan: an easy Discord bot starting point for humans and coding agents

Status: proposed for review. This first PR adds only `AGENTS.md` and this plan.
README edits, JSDoc changes, dependency upgrades, and implementation checks below
are follow-up work.

## Goal and boundaries

Position this template as an easy starting point for both humans and coding
agents to mold into the bot they need. Keep the small, typed custom handlers,
Bun runtime, ESM, existing command types, and working Docker deployment.

Suggested positioning: **A minimal TypeScript Discord bot starter for humans
and coding agents. Start with working commands and events, then shape it into
your own bot.**

This is an onboarding and maintenance improvement, not an architecture rewrite.
There is no planned AI runtime, hosted service, database, framework migration,
command-loader redesign, or Docker overhaul. Preserve existing behavior except
for narrowly required compatibility fixes, documented in the upgrade PR.

## Current baseline

- `package.json`: Bun executes `src/index.ts` directly; scripts are `dev` and
  `start`. There is no compilation step or automated test suite.
- Commands and listeners are discovered from category folders. `Client.ts`
  contains prefixes, owner IDs, presence, intents, and registry choices.
- Examples cover slash commands, user/message context menus, legacy message
  commands, autocomplete, pagination, prompts, and mention resolution.
- JSDoc is uneven: `Resolver` already has substantial documentation, while the
  other structures and core helpers need an inventory and targeted additions.
- The README addresses human TypeScript users, incorrectly mentions compilation,
  and does not explain how to give a coding agent a focused task.
- Docker uses `oven/bun:1.3.0`, multiple stages, cached dependency installation,
  production dependency installation, and frozen lockfile commands. Preserve
  this deployment approach.
- The lockfile workspace lists `latest` specifiers while `package.json` pins
  exact versions. Reconcile these through Bun during the upgrade, without
  manually editing package resolutions.

Baseline inspection on 2026-11-23 used the installed dependencies matching the
direct versions in `package.json`. Running
`node node_modules/typescript/bin/tsc --noEmit -p src/tsconfig.json` reported:

- `Command.ts:2`: the imported internal `discord-api-types` type is not exported
  under its current name.
- `Paginator.ts:117`: reply flag types do not match the discord.js overloads.
- `Paginator.ts:163`: top-level message components need appropriate narrowing
  before use as action rows.

These are existing static-check findings, not evidence that the working bot
needs a redesign. Resolve them with focused compatibility changes in the
upgrade work. Bun is unavailable in the planning environment, so a fresh frozen
install, Bun execution, and container/live Discord smoke checks have not been
performed for this PR.

## 1. Make onboarding useful for both audiences

- [ ] Update the README title, introduction, and feature wording around the
      positioning above. Explain that agents help customize the source; using
      the template does not require an AI provider or API key.
- [ ] Provide one short quick start: create a template repository, install the
      documented Bun version, install dependencies, copy `.env.example`, set
      both environment values, configure the sample owner ID, and run `bun dev`.
      Correct the compilation claim and use examples matching current APIs.
- [ ] Explain Discord application creation, bot invitation and required scopes,
      channel permissions, and the Message Content intent needed by legacy
      commands and prompts. Keep slash-only needs distinct from message needs.
- [ ] Add a short source map and recipes for adding a slash command, listener,
      autocomplete, and a message/context-menu command using existing examples.
      Explain one-level discovery, default exports, names, and import aliases.
- [ ] Add a coding-agent quick start that points to `AGENTS.md`, asks the user
      to describe the desired behavior, and gives bounded example prompts:
      “Add a `/hello` command using the existing Command wrapper; keep the
      handlers and Dockerfile as they are; report type and formatting checks,”
      and “Add a listener using the existing Listener wrapper; document its
      event and intent requirements.”
- [ ] Document prefixes, presence, owner IDs, test-server scope, registry modes,
      and the owner-only `eval` example. Explain that startup can replace command
      registrations and that sync can delete registrations missing locally.
- [ ] Preserve the Docker build/run instructions, showing environment injection
      for both variables and overriding the sample `TEST_SERVER_ID` default.

Acceptance: a human or agent can find the right file, add one basic capability
without changing core infrastructure, and follow the documented setup without
guessing environment values, permissions, or nonexistent scripts.

## 2. Fill JSDoc gaps without changing behavior

- [ ] Inventory public classes, constructors, methods, option interfaces, and
      exported helpers in `src/lib/structures`, `src/core`, and related enums.
      Retain accurate existing docs, including `Resolver` documentation.
- [ ] Document `Command` options and command-type relationships, `Listener`
      event arguments and the appended client argument, and `Client` startup,
      configuration points, and registration side effects.
- [ ] Document registry modes, guild/global scope, bulk replacement, deletion
      behavior, and asynchronous behavior as actually implemented. Do not claim
      that API requests are awaited where they currently are not.
- [ ] Cover `Paginator` and `Prompt` options/defaults, timeouts, collector
      filtering and cleanup, return values, and permission/intent assumptions.
      Clarify `Resolver` cache-only resolution and helper limitations, and
      explain logger levels.
- [ ] Use concise summaries and relevant `@param`, `@returns`, `@throws`, and
      `@example` tags. Add small copyable examples for the main extension points;
      avoid duplicating TypeScript types or commenting every obvious statement.

Acceptance: editor hovers and source documentation explain how to extend the
starter and what each reusable helper actually does. Comments introduce no
behavior changes; any discovered bug is tracked or fixed separately.

## 3. Upgrade the toolchain and every direct package

Target the latest stable releases when implementation begins, including
**TypeScript 7** and **Bun**. Resolve versions from official release metadata,
record the selected versions and sources in the upgrade PR, and pin concrete
versions for reproducibility. Recheck release status rather than assuming a
preview tag is stable or that this snapshot stays current.

Observed stable releases below were checked against npm metadata and the Bun
release on 2026-11-23. They are a research snapshot, not changes made in this PR.

| Component            | Current pin | Observed stable | Upgrade scope                                                                         |
| -------------------- | ----------- | --------------- | ------------------------------------------------------------------------------------- |
| Bun runtime / Docker | `1.3.0`     | `1.4.5`         | Align local instructions, package-manager metadata, and the existing Docker base tag. |
| `typescript`         | `5.9.3`     | `7.0.2`         | Stable v7 compiler and only the config changes required for it.                       |
| `discord.js`         | `14.23.2`   | `14.28.1`       | Review migration notes and the selected release's engine requirements.                |
| `discord-api-types`  | `0.38.30`   | `0.38.60`       | Replace fragile internal type usage with public equivalents.                          |
| `colorette`          | `2.0.20`    | `2.0.20`        | Already current in this snapshot; recheck during implementation.                      |
| `prettier`           | `3.6.2`     | `3.10.1`        | Preserve repository formatting choices.                                               |
| `@types/node`        | `24.7.2`    | `26.6.6`        | Check compatibility with Bun and dependency declarations.                             |
| `@types/bun`         | `1.3.0`     | `1.4.5`         | Keep compatible with the selected Bun runtime.                                        |

- [ ] Record exact latest stable versions, release channels, relevant breaking
      changes, and runtime/type compatibility before editing dependencies.
- [ ] Upgrade Bun and packages, regenerate `bun.lock`, and review transitive
      changes. Preserve exact direct pins; do not hand-edit the lockfile or
      force transitive overrides without evidence they are needed.
- [ ] Migrate `src/tsconfig.json` for TypeScript 7: replace the removed legacy
      `moduleResolution: "Node"` with a mode suitable for Bun, remove `baseUrl`,
      keep paths relative to the config, and explicitly include ambient types
      such as `types: ["bun", "node"]` to account for the changed defaults.
      Keep strict checking, no emit, ESM, aliases, and direct Bun execution.
- [ ] Use the stable compiler's published package and binary. Do not silently
      substitute `@typescript/native-preview` or assume `tsgo` and `tsc` are
      interchangeable. If the stable v7 release cannot be obtained, report the
      specific blocker and keep the v7 task open.
- [ ] Make only required API/type fixes. Check the internal type import,
      paginator flags/components, ready event naming, deprecated DM permission
      fields versus contexts, interaction response methods, and registry
      payloads against the chosen discord.js version and Discord API docs.
      Do not migrate features just because a new API exists.
- [ ] Add minimal `typecheck` and `format:check` package scripts so people and
      agents share reproducible checks; update docs to use them once available.
- [ ] Change the pinned Bun base image version while preserving Docker stages,
      caching, install commands, and entrypoint. Check that the final image
      still runs with the intended dependency set; address a demonstrated
      packaging issue narrowly rather than redesigning the build.

Acceptance: all direct dependencies are current stable versions at the time of
the upgrade (with any unchanged latest version identified), TypeScript 7 checks
pass, Bun runs the existing starter, the lockfile is reproducible, and the
existing Docker path works. Document any compatibility blocker rather than
calling the upgrade complete with an older or preview compiler.

## 4. Validate the implementation and keep the review small

- [ ] Run a clean `bun install --frozen-lockfile` with the selected Bun version;
      confirm it succeeds without changing the committed lockfile. Verify the
      production frozen install used by Docker as well.
- [ ] Run type checking, formatting on changed files, and `git diff --check`.
      Resolve the recorded type failures and any upgrade regressions without
      weakening strictness.
- [ ] Build the existing Dockerfile. Compare final dependency contents and
      image size with the baseline using the same platform; investigate a
      material regression without treating image optimization as new scope.
- [ ] With a dedicated development application/server, smoke-test startup and
      registration, slash and context-menu commands, legacy message commands,
      autocomplete, owner restrictions, pagination controls/timeouts, and
      prompt completion/timeouts. Run a container startup check with environment
      injection. Record unavailable credentials or untested paths explicitly.
- [ ] Add a focused regression test if a compatibility fix changes substantive
      behavior. Avoid a large testing framework or CI expansion for this work.
- [ ] Follow the quick start from a fresh template checkout, then perform one
      small customization using the documented coding-agent instructions.

Suggested PR sequence after this planning review: (1) README/onboarding,
(2) JSDoc coverage, (3) dependency/toolchain upgrades with necessary compatibility
fixes and validation. Update the plan as each step ships. Each PR should state
what changed, what was verified, and any remaining limitation.

## Upstream references

- [Bun releases](https://github.com/oven-sh/bun/releases) and
  [Docker guide](https://bun.sh/docs/guides/ecosystem/docker)
- [TypeScript releases](https://github.com/microsoft/TypeScript/releases) and
  [TypeScript 7 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [TypeScript 6 transition notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)
  for module resolution, `baseUrl`, and ambient type migration details
- [discord.js releases](https://github.com/discordjs/discord.js/releases) and
  [documentation](https://discord.js.org/docs/packages/discord.js/main)
- [discord-api-types](https://github.com/discordjs/discord-api-types)
- [Discord application commands](https://docs.discord.com/developers/interactions/application-commands)
  and [Gateway intents](https://docs.discord.com/developers/events/gateway#gateway-intents)
- [npm registry metadata](https://registry.npmjs.org/) for direct dependency
  versions and distribution tags
- Snapshot examples: [Bun 1.4.5](https://github.com/oven-sh/bun/releases/tag/bun-v1.4.5),
  [TypeScript 7.0.2 metadata](https://registry.npmjs.org/typescript/7.0.2), and
  [discord.js 14.28.1 metadata](https://registry.npmjs.org/discord.js/14.28.1).
  Prefer the selected package's engine metadata/tagged source over a docs landing
  page that may describe a different release; keep Bun as the bot runtime.
