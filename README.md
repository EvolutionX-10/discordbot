# Discord bot starter for humans and coding agents

A minimal TypeScript Discord bot starter built with [Bun](https://bun.sh/) and
[discord.js](https://discord.js.org/). Start with working commands and events,
then shape it into your own bot, by hand or with a coding agent.

The source is yours to adapt: small custom handlers, typed command and listener
wrappers, ESM imports, and a Docker deployment. Coding agents use the same source,
examples, and checks as people. No AI provider or API key is required.

## What's included

- Slash commands, user and message context menus, legacy message commands, and
  autocomplete, with automatic application-command registration.
- `Command` and `Listener` wrappers with inferred handler argument types.
- `Paginator` for embeds and navigation controls, `Prompt` for message-based
  questionnaires, `Resolver` for cached mentions, and a colored `Logger`.
- Direct TypeScript execution with Bun, minimal dependencies, and the existing
  multi-stage Docker build.

For automated contributions, start with [AGENTS.md](./AGENTS.md). The maintenance
roadmap, including the planned TypeScript 7 upgrade, is in [plan.md](./plan.md).
Basic JavaScript and TypeScript knowledge helps when reviewing generated changes;
see the [JavaScript guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
and [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/intro.html).

## Quick start

1. [Use this template](https://github.com/EvolutionX-10/discordbot/generate),
   clone your new repository, and open a terminal in its root directory.
2. Install **Bun 1.3.0**, matching the current [Dockerfile](./Dockerfile), using
   the [Bun installation guide](https://bun.sh/docs/installation).
3. Create a development application and bot in the
   [Discord Developer Portal](https://discord.com/developers/applications).
   Under **Bot**, enable **Message Content Intent** for the included message
   commands and survey example. Copy the bot token into your local `.env` only.
4. Under **OAuth2 → URL Generator**, select the `bot` and
   `applications.commands` scopes. For the included examples, grant **View
   Channels**, **Send Messages**, **Read Message History**, and **Embed Links**,
   then use the generated URL to invite the bot to your development server.
   Check channel overrides too; Administrator permission is unnecessary.
5. Install dependencies and copy the environment example:

   ```sh
   bun install
   cp .env.example .env
   ```

   Bun runs the TypeScript source directly; there is no compilation step.
   Keep `bun.lock` as the only package-manager lockfile.

6. Set both values in `.env`:

   ```dotenv
   DISCORD_TOKEN=your_bot_token
   TEST_SERVER_ID=your_development_server_id
   ```

   Enable Discord's **Developer Mode**, then right-click your server to copy
   its ID. In [Client.ts](./src/lib/structures/Client.ts), replace the sample
   `ownerIds` value with your own Discord user ID. Never commit your `.env` or
   paste its token into a coding-agent prompt.

7. Start the bot:

   ```sh
   bun dev
   ```

   Look for the login log and try `/ping` in your server. `bun start` runs
   without watch mode. Run both from the repository root: discovery uses the
   current working directory.

Slash commands need the `Guilds` intent, not Message Content. This starter also
enables guild/direct message events and Message Content for its other examples.
If you build a slash-only bot, remove the message-based commands/listener and
their unused intents together. `Prompt` reads text replies, including when
started from `/survey`. Deleting other users' replies with `autoDelete` also
requires **Manage Messages** in the channel.

Startup registers commands against Discord. Use a dedicated development
application/server: the default registry mode replaces command lists, including
global registrations. See [Registration](#registration) before changing modes.
The included `eval` example executes code; keep it owner-only and restricted to
your test server, or remove it if your bot does not need it.

## Customize by hand or with a coding agent

Give your agent the desired behavior, who can use it, its command/event type,
and any permission or data requirements. Point it at [AGENTS.md](./AGENTS.md)
and the closest example. Keep tokens in your local environment.

Example tasks:

> Read AGENTS.md and src/commands/General/ping.ts. Add a `/hello` command using
> the existing Command wrapper that replies privately with a greeting. Keep the
> handlers and Dockerfile as they are. Add useful JSDoc and report the type and
> formatting checks you ran.

> Read AGENTS.md and the Listener wrapper. Add a guildCreate listener that logs
> the joined server's name using the existing logger. Document the event and
> required intents. Keep the current loaders and dependencies.

Review the resulting diff, follow the checks below, and try the changed command
or event with your development bot.

### Where to change things

| Want to change                                    | Start here                                                                                     |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Prefixes, owner IDs, presence, intents, log level | [Client.ts](./src/lib/structures/Client.ts)                                                    |
| Add a command                                     | [src/commands/General](./src/commands/General)                                                 |
| Add an event listener                             | [src/listeners/core](./src/listeners/core) and [Listener.ts](./src/lib/structures/Listener.ts) |
| Command types and options                         | [Command.ts](./src/lib/structures/Command.ts) and [command.ts](./src/lib/enums/command.ts)     |
| Discovery and registration                        | [src/core](./src/core)                                                                         |
| Pagination, prompts, mention resolution, logging  | [src/lib/structures](./src/lib/structures)                                                     |
| Environment variable types                        | [env.d.ts](./src/lib/types/env.d.ts)                                                           |

Create `.ts` files one category directory below `src/commands` or
`src/listeners`; discovery is not recursive. Default-export a `new Command(...)`
or `new Listener(...)`. Filenames supply names unless the instance sets one
explicitly. Restart the bot to load new files and register new commands.

Use the existing aliases: `#lib/structures`, `#lib/enums`, `#core`, and `#root/*`.
Keep their runtime definitions in `package.json` aligned with `src/tsconfig.json`
if you change them.

### Add a slash command

Create `src/commands/General/hello.ts`:

```ts
import { CommandType } from '#lib/enums';
import { Command } from '#lib/structures';
import { MessageFlags } from 'discord.js';

export default new Command({
	type: CommandType.ChatInput,
	description: 'Get a greeting',
	async commandRun(interaction) {
		return interaction.reply({ content: 'Hello!', flags: MessageFlags.Ephemeral });
	},
});
```

The filename becomes `/hello`. Omit `guildIds` for a global command, or set
`guildIds: [process.env.TEST_SERVER_ID]` for your development server. The default
registry shortcut targets one server for all guild commands, so keep those IDs
consistent; use detailed registration for multiple servers.

### Add an event listener

Create `src/listeners/General/joinedGuild.ts` (create the category directory too):

```ts
import { Listener } from '#lib/structures';

export default new Listener({
	event: 'guildCreate',
	run(guild, client) {
		client.logger.info(`Joined ${guild.name}`);
	},
});
```

Handlers receive the normal discord.js event arguments, then the starter's
client as the last argument. `once: true` attaches a one-time listener. For a
login listener, use the `clientReady` event. `guildCreate` needs the `Guilds`
intent, which is already enabled.

### Reuse the other examples

| Capability                     | Example and adaptation                                                                                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Autocomplete                   | [ping.ts](./src/commands/General/ping.ts): set `autocomplete: true` on a string option and supply `autoCompleteRun`; respond with choices using `interaction.respond(...)`. |
| User context menu              | [pong.ts](./src/commands/General/pong.ts): use `CommandType.User` and `commandRun`; find it under a user's **Apps** menu.                                                   |
| Message context menu           | [save.ts](./src/commands/General/save.ts): use `CommandType.Message`; its explicit `name: 'Save'` overrides the filename.                                                   |
| Message command                | [say.ts](./src/commands/General/say.ts): use `CommandType.Legacy` and `messageRun(message, args)`; try `!say hello`.                                                        |
| Slash and message entry points | [paginate.ts](./src/commands/General/paginate.ts) and [survey.ts](./src/commands/General/survey.ts): supply both handlers and optional message aliases.                     |

Set prefixes (currently `q!` and `!`) and owner IDs in `Client.ts`. Use
`defaultMemberPermissions` for Discord's default application-command permissions
and `ownerOnly: true` for the starter's owner check. They serve different purposes;
review authorization for the behavior you add. `dmPermission: false` currently
disables DM use for global application commands; it is a legacy API field whose
compatibility is tracked in the upgrade plan.

### Registration

The `initiateCommands` call in `Client.login` controls the modes:

| Mode                       | Current behavior                                                                                                                                                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shortcut: true` (default) | Bulk-replaces the nonempty global command list and the guild list for the first guild command's first server ID. Commands missing from a submitted list are removed. All guild commands must target that same server. An empty local list does not clear remote commands. |
| `register: true`           | Individually creates or updates commands, visiting each command's guild IDs. It leaves unrelated registrations in place.                                                                                                                                                  |
| `sync: true`               | Deletes global/cached-guild registrations whose names are absent locally; it does not create or update commands.                                                                                                                                                          |

Enable only the work you intend; the flags can run concurrently. Registration
helpers currently dispatch some requests without awaiting completion, so the
“Commands Synced” log is not confirmation that every API operation has finished.
Check Discord and error output before assuming a deployment is complete.

## Production with Docker

Build and run the existing Dockerfile from the repository root:

```sh
docker build -t discordbot .
docker run -d --name discordbot --env-file .env discordbot
```

The `.env` file must contain both `DISCORD_TOKEN` and your `TEST_SERVER_ID`; the
latter overrides the Dockerfile's sample default. Configure your owner ID and
other source settings before building. `.env` is excluded from the image. Use
`docker logs discordbot` to inspect startup without printing the token.

The image uses Bun directly, with the existing dependency caching and
multi-stage build. See [Docker's getting-started guide](https://docs.docker.com/get-started/)
if Docker is new to you.

## Checks and contributions

Read [AGENTS.md](./AGENTS.md) for contribution conventions, including the
required Git commit identity. Keep PRs small and explain the behavior, reason,
and validation. Follow [Conventional Commits](https://www.conventionalcommits.org/)
and the existing Prettier configuration.

After installing dependencies, check types and format the files you changed:

```sh
bun run tsc --noEmit -p src/tsconfig.json
bun run prettier --check README.md
git diff --check
```

Replace `README.md` with your changed files. Only `dev` and `start` are package
scripts today. There is no automated test suite; [plan.md](./plan.md) records
existing type-check failures to address during the dependency upgrade. Report
actual results and any unavailable live checks, then exercise your changes in
the development server. Dependency/container changes should also pass a frozen
install and Docker build.
