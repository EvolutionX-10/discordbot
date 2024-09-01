<div align="center">
<h1>
	Discord bot written in TypeScript
</h1>
	<br />
	<p>
		<a href="https://discord.js.org"><img src="https://discord.js.org/static/logo.svg" width="546" alt="discord.js" /></a>
	</p>
</div>

## About the project

This project is not intended to be a fully-functional bot, but rather a simple handler for handling of commands and events. I've seen a lot of people finding it hard to make their own handlers in TypeScript and ending up using `any` everywhere.
This place can be a good start for you to begin your journey of making a bot in TypeScript without depending on other dedicated handlers. Custom handlers have this advantage that its your own handler, you can add whatever feature you like and whatever you want.

## Features

- Written in [TypeScript](https://www.typescriptlang.org/) 😋
- Uses [v14.15](https://discordjs.dev/) 😎
- Fully ESM based 😍
- Minimal dependencies ⚡
- Automated Registering/Updating/Deleting/Syncing of Application Commands 😮
- Default commands 😄
  - Chat Input (Slash) Commands [`ping`, `eval`, `paginate`, `survey`]
  - User Commands [`pong`]
  - Message Commands [`Save`]
  - Legacy Commands [`say`, `paginate`, `survey`]
- Supports Message Commands, Chat Input Commands, ContextMenu Commands, and more! 😜
- Type safe, simple, and easy to understand 👍
- Valid and Robust Autocompletions in your IDE for commands and listeners 😲
- Extended Client with useful features 🤩
- Colorful and detailed logging 💡
- Paginator Class for easy pagination using embeds, buttons, and select menus! 😉
- Resolver Class for easy resolving of multi mentions in chat input command option! 😳
- Prompt Class if you want to ask series of questions and have message content intent 🤗

## Before you begin

This guide assumes you have solid understanding of JavaScript and at least basic understanding of TypeScript. If you don't, I recommend you start with the [JavaScript guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) and [TypeScript book](https://www.typescriptlang.org/docs/).

## Getting Started

Click on [`Use this template`](https://github.com/EvolutionX-10/discordbot/generate) button and it will generate a new repository based on this repository in your account. Once done, you may clone your repository locally using git[^git]. <br />
You also need to have a Discord Bot application created. If you haven't done it yet, you can do it by following the guide [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot).

## Dev Setup

Now you can proceed to install dependencies. <br />
After that, we will compile our TypeScript code to JavaScript

> **Note**
> This project uses `bun` to manage dependencies. If you don't have `bun` installed, you can read [here](https://bun.sh/docs/installation) on how to install it.

```bash
bun install
```

### Setting token

1. Rename `.env.example` to `.env`
2. Add your token to the `.env` file in this format

```
DISCORD_TOKEN=<your-token-without-braces>
```

### Starting the bot

Now we can start the bot using `bun run dev` script.

```bash
bun run dev
```

## Production Setup

To run in production environment, we use Docker. You can read more about it [here](https://docs.docker.com/get-started/).

### Building the image

```bash
docker build -t discordbot .
```

### Running the image

```bash
docker run -d --name discordbot -e DISCORD_TOKEN=<your-token-without-braces> discordbot
```

## Commands and Listeners

<details>
<summary>Commands</summary>

#### Example

```ts
import { CommandType } from '#lib/enums';
import { Command } from '#lib/structures';

export default new Command({
	type: CommandType.ChatInput,
	description: 'Ping Pong!!',
	async commandRun(interaction) {
		return interaction.reply({ content: 'Pong!', ephemeral: true });
	},
	async messageRun(message) {
		return message.channel.send('Pong!');
	},
});
```

</details>

<details>

<summary>Listeners</summary>

#### Example

```ts
import { Listener } from '#lib/structures';

export default new Listener({
	event: 'ready',
	once: true,
	run(client) {
		client.logger.info(`Logged in as ${client.user.tag}`);
	},
});
```

</details>

## Contributing

To contribute to this repository, feel free to fork the repository and make changes. Once you have made your changes, you can submit a pull request.
A change should have a valid reason, and features should be added only if it's basic.

1. Fork the repository and select the **main** branch.
2. Create a new branch and make your changes.
3. Make sure you use a proper code formatter. [^lint]
4. Make sure you have a good commit message.[^commit]
5. Push your changes.
6. Submit a pull request [here][pr].
<!-- References -->

[^git]: It's recommended to have [git](https://git-scm.com/) installed on your machine.

[^lint]: We recommend using [`prettier`] to style your code.

[^commit]: We strongly follow the [`Commit Message Conventions`]. This is important when commiting your code for a PR.

[`prettier`]: https://prettier.io/
[`commit message conventions`]: https://conventionalcommits.org/en/v1.0.0/
[pr]: https://github.com/EvolutionX-10/discordbot/pulls
