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

- Written in [TypeScript](https://www.typescriptlang.org/)
- Fully ESM based
- Minimal dependencies
- Automated Registering/Updating/Deleting/Syncing of Application Commands
- Default commands
  - Chat Input (Slash) Commands [`ping`, `reload`, `eval`]
  - User Commands [`pong`]
  - Message Commands [`say`]
- Supports Message Commands, ChatInput Commands, ContextMenu Commands, and more
- Type safe, simple, and easy to understand
- Valid Autocompletions in your IDE for commands and listeners
- Colorful and detailed logging
- Paginator Class for easy pagination using embeds, buttons, and select menus!
- Resolver Class for easy resolving of multi mentions in chat input commands

## Before you begin

This guide assumes you have solid understanding of JavaScript and at least basic understanding of TypeScript. If you don't, I recommend you start with the [JavaScript guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) and [TypeScript book](https://www.typescriptlang.org/docs/).

## Getting Started

Click on [`Use this template`](https://github.com/EvolutionX-10/discordbot/generate) button and it will generate a new repository based on this repository in your account. Once done, you may clone your repository locally using git[^git]. <br>
You also need to have a Discord Bot application created. If you haven't done it yet, you can do it by following the guide [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot).

## Installation

Now you can proceed to install dependencies. <br>
After that, we will compile our TypeScript code to JavaScript

Note: This project uses `yarn` to manage dependencies. If you don't have `yarn` installed, you can install it using [`npm install -g yarn`](https://yarnpkg.com/en/docs/install).

```bash
yarn && yarn build
```

## Setting token

1. Rename `.env.example` to `.env`
2. Add your token to the `.env` file in this format

```
DISCORD_TOKEN=<your-token-without-braces>
```

## Starting the bot

Now we can start the bot using `yarn start` script.

```bash
yarn start
```

Note: You need to have node version `16.9` or higher!

## Commands

Each command needs to be exported as `command`

#### Example:

```ts
import { Command } from '#lib/structures';
import { ApplicationCommandType } from 'discord.js';

export const command = new Command({
	type: ApplicationCommandType.ChatInput,
	description: 'Ping Pong!!',
	commandRun(interaction) {
		return interaction.reply({ content: 'Pong!', ephemeral: true });
	},
	messageRun(message) {
		return message.channel.send('Pong!');
	},
});
```

## Listeners

Each listener needs to be exported as `listener`

#### Example:

```ts
import { Listener } from '#lib/structures';

export const listener = new Listener({
	event: 'ready',
	once: true,
	async run(client) {
		client.logger.info(`Logged in as ${client.user.tag}`);
	},
});
```

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
