# Working on this Discord bot starter

This is a small Bun + TypeScript + discord.js starter for humans and coding
agents to adapt into their own bots. Keep it easy to understand, extend, and
deploy. Agent-friendly means clear instructions, types, examples, and extension
points; it does not require adding an AI service to the running bot.

Read `README.md`, `package.json`, and the files involved in your task first.
`plan.md` describes proposed improvements and their acceptance criteria. Its
unchecked tasks are future work, not features that already exist or instructions
to implement the entire roadmap in one change.

## Required Git commit identity

Use this identity for both the author and committer of every commit:

- Name: `EvolutionX-10`
- Email: `85353424+EvolutionX-10@users.noreply.github.com`

Configure it locally before committing:

```sh
git config --local user.name 'EvolutionX-10'
git config --local user.email '85353424+EvolutionX-10@users.noreply.github.com'
```

Check `git var GIT_AUTHOR_IDENT` and `git var GIT_COMMITTER_IDENT` before each
commit. Environment variables can override Git configuration; ensure both
identities match the values above. Verify the resulting author and committer
with `git log -1 --format=fuller` before pushing. Never use an inherited machine
or organization identity instead.

## Keep the working foundation

- Prefer small changes that follow the existing patterns. Preserve the custom
  handlers, ESM, strict typing, import aliases, and direct execution of TypeScript
  with Bun.
- Preserve the working multi-stage Dockerfile and dependency caching strategy.
  A Bun version update may change its pinned base image; it does not justify
  restructuring stages, changing the entrypoint, or adding a build system.
- Keep dependencies minimal. Add a dependency only when the task needs it and
  explain why the existing code or platform APIs are insufficient.
- Do not introduce a framework, plugin system, database, AI SDK, or generic
  abstraction for a simple command or listener.
- Keep unrelated formatting, refactors, and feature changes out of the diff.

## Repository map and extension points

| Path                            | Purpose and where to make changes                                                                   |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| `src/index.ts`                  | Creates the client and logs in.                                                                     |
| `src/lib/structures/Client.ts`  | Intents, partials, presence, prefixes, owner IDs, collections, and startup registration choices.    |
| `src/commands/<category>/*.ts`  | Default-exported `new Command(...)` instances; copy the closest existing example for a new command. |
| `src/listeners/<category>/*.ts` | Default-exported `new Listener(...)` instances for Discord events.                                  |
| `src/core/handleRegistry.ts`    | Command discovery, registration, and synchronization.                                               |
| `src/core/handleListener.ts`    | Listener discovery and event attachment.                                                            |
| `src/listeners/core/`           | Dispatch for message commands, interactions, and autocomplete.                                      |
| `src/lib/structures/`           | Typed `Command` and `Listener` wrappers, `Logger`, `Paginator`, `Prompt`, and `Resolver`.           |
| `src/lib/enums/`                | Command types and logging levels.                                                                   |
| `src/lib/types/env.d.ts`        | Bun environment variable declarations.                                                              |
| `src/tsconfig.json`             | Strict, no-emit type checking and alias resolution.                                                 |
| `.env.example`                  | Required local environment variable names, without credentials.                                     |
| `Dockerfile`                    | Existing production deployment path.                                                                |

The loaders scan category directories one level below `src/commands` and
`src/listeners` for `.ts` files. They derive names from filenames unless the
instance supplies a name. Do not assume recursive discovery. Run commands from
the repository root because the loaders use `process.cwd()`.

Use `#lib/structures`, `#lib/enums`, `#core`, and `#root/*` consistently with
existing code. If an upgrade requires alias changes, keep `package.json` imports,
TypeScript resolution, and Bun runtime behavior aligned.

## Local setup and existing commands

Use Bun and the committed `bun.lock`; do not introduce another package manager
or lockfile. Use the pinned Bun version documented by the project/Dockerfile.

```sh
bun install --frozen-lockfile
cp .env.example .env
```

Set `DISCORD_TOKEN` and `TEST_SERVER_ID` locally, and replace the sample owner ID
in `Client.ts` before using owner-only commands. Message commands and `Prompt`
need the Message Content intent enabled in the Developer Portal as well as in
the client. Keep tokens out of source, examples, logs, prompts, and PRs.

| Command                                     | Purpose                                                            |
| ------------------------------------------- | ------------------------------------------------------------------ |
| `bun dev`                                   | Watch and run locally; connects to Discord and registers commands. |
| `bun start`                                 | Run without watch; also connects and registers commands.           |
| `bun run tsc --noEmit -p src/tsconfig.json` | Check types with the installed compiler.                           |
| `bun run prettier --check <changed-files>`  | Check formatting using the existing configuration.                 |
| `docker build -t discordbot .`              | Build with the existing production Dockerfile.                     |

There are currently only `dev` and `start` package scripts and no automated test
suite. Do not claim a `test`, `lint`, or `typecheck` script exists until it is
added. Report missing tools or existing failures accurately; see the baseline
notes in `plan.md`.

Starting the bot is a live integration action: the current shortcut registration
uses bulk command updates, and synchronization can delete commands absent
locally. Use a dedicated development application/server for live checks. The
sample `eval` command executes code and must remain owner-only and scoped to the
configured test server. Pass your own `TEST_SERVER_ID` when running the container
instead of relying on its sample default.

## Code and JSDoc

- Follow the existing Prettier configuration, TypeScript types, and naming.
  Preserve inference and generics rather than silencing errors with `any`, broad
  casts, or weaker compiler settings.
- Add or improve JSDoc for touched public classes, constructors, methods,
  configuration options, and exported helpers where intent or behavior is
  missing. Preserve accurate existing documentation.
- Explain defaults, supported command/event types, return behavior, errors,
  side effects, permission/intent requirements, and collector timeout/cleanup
  behavior where relevant. Use `@param`, `@returns`, `@throws`, and `@example`
  when they help; do not repeat obvious TypeScript annotations.
- Prefer documented public discord.js and Discord API types over imports from
  `utils/internals`. Check current upstream documentation before migrations.
- For dependency upgrades, verify current releases, pin concrete versions,
  regenerate `bun.lock` with Bun, and recheck a frozen install. Keep runtime,
  types, compiler, and Docker Bun versions compatible. TypeScript 7 is the
  roadmap target; do not substitute a preview silently.

## Verification and handoff

Check formatting for changed files and run `git diff --check`. For code or
dependency changes, run the compiler and relevant focused checks; build Docker
when dependencies or the container change. Exercise affected command types and
helpers in the development server when credentials and access are available.
Use focused regression tests for substantive behavior changes, without adding
a test framework just for prose or comments.

In each PR, explain what changed, why, the commands/checks actually run, and any
remaining failures or unavailable live checks. Keep roadmap checkboxes accurate
and documentation consistent with the shipped behavior. Use a Conventional
Commit message, following the existing contribution guidance.
