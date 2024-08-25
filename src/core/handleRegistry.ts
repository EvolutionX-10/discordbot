import { CommandType } from '#lib/enums';
import { Client, Command } from '#lib/structures';
import { ApplicationCommandData, ApplicationCommandType, REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { greenBright, italic } from 'colorette';

export async function initiateCommands(client: Client, registryOptions: RegistryOptions) {
	const { register, shortcut, sync } = registryOptions;
	if (register && shortcut && sync)
		client.logger.warn(
			`It is NOT recommended to set all registry options to true as it spams the API, please use a single method!`,
		);
	client.logger.info(`Syncing Commands...`);
	const now = Date.now();
	await Promise.all([
		shortcut && registerViaRoutes(client),
		register && registerCommands(client),
		sync && syncCommands(client),
	]);
	const diff = Date.now() - now;
	client.logger.info(`Commands Synced in ${greenBright(`${diff.toLocaleString()}ms`)}!`);
}

export async function handleRegistry(client: Client) {
	const commandFolders = readdirSync(`${process.cwd()}/src/commands`);
	for (const folder of commandFolders) {
		const commandsFiles = readdirSync(`${process.cwd()}/src/commands/${folder}`).filter((file) => file.endsWith('.ts'));

		for (const file of commandsFiles) {
			const path = `../commands/${folder}/${file}`;
			const { default: command } = (await import(path)) as { default: Command };

			if (!command)
				throw new Error(
					`There is no default exported Command Class in ${file}!\nPath: ${process.cwd()}/src/commands/${folder}/${file}`,
				);

			command.name = file.split('.')[0];

			client.commands.set(command.name, command);
		}
	}
}

function registerViaRoutes(client: Client) {
	const rest = new REST({ version: '10' }).setToken(client.token!);
	const guildCommands = client.commands.filter((c) => Boolean(c.commandRun) && Boolean(c.guildIds.length));
	const globalCommands = client.commands.filter((c) => Boolean(c.commandRun) && !c.guildIds.length);

	if (globalCommands.size) {
		client.logger.debug(`Started refreshing ${globalCommands.size} application (/) commands.`);
		rest.put(Routes.applicationCommands(client.user!.id), {
			body: globalCommands.map((g) => g.buildAPIApplicationCommand()),
		});
		client.logger.debug(`Successfully reloaded ${globalCommands.size} application (/) commands.`);
	}

	if (guildCommands.size) {
		const mapOfGuildIds = [...new Set(guildCommands.map((c) => c.guildIds).flat())];

		if (mapOfGuildIds.length > 1) {
			client.logger.warn('Using Routes (faster) method, only first guild id will be considered!');
			client.logger.warn('Please use detailed registry for multiple guilds');
		}

		client.logger.debug(`Started refreshing ${guildCommands.size} application (/) guild commands.`);

		rest.put(Routes.applicationGuildCommands(client.user!.id, guildCommands.first()!.guildIds[0]), {
			body: guildCommands.map((g) => g.buildAPIApplicationCommand()),
		});
		client.logger.debug(`Successfully reloaded ${guildCommands.size} application (/) guild commands.`);
	}
}

function registerCommands(client: Client) {
	const applicationCommands = client.commands
		.filter((c) => Boolean(c.commandRun) && c.type !== CommandType.Legacy)
		.values();
	for (const command of applicationCommands) {
		checkFromClient(client, command);
	}
}

async function checkFromClient(client: Client, command: Command) {
	const { logger } = client;

	logger.debug(`Checking if ${italic(command.name)} is already registered`);

	// Guild Command Check

	if (command.guildIds?.length) {
		for (const guildId of command.guildIds) {
			const guild = await client.guilds.fetch(guildId).catch(() => null);

			if (!guild) throw new Error(`Invalid Guild Id in ${command.name}.ts!`);

			const APICommand = (await guild.commands.fetch()).find((cmd) => cmd.name === command.name);

			const providedCommandData: ApplicationCommandData = {
				name: command.name,
				type: command.type as unknown as ApplicationCommandType,
				options: command.options,
				description: command.description ?? '',
				defaultMemberPermissions: command.permissions,
			};
			if (!APICommand) {
				await guild.commands.create(providedCommandData);
				logger.info(`Created Command ${command.name} -> ${guild.name}`);
				continue;
			}

			if (!APICommand.equals(providedCommandData, true)) {
				await APICommand.edit(providedCommandData);
				logger.debug(`Updated Command ${command.name} -> ${guild.name}`);
			}
		}
		logger.debug(`Processed Command ${command.name}`);
		return;
	}

	// Global Command Check

	const APICommand = (await (await client.application?.fetch())!.commands.fetch()).find(
		(cmd) => cmd.name === command.name,
	);

	const providedCommandData: ApplicationCommandData = {
		name: command.name,
		type: command.type as unknown as ApplicationCommandType,
		options: command.options,
		description: command.description ?? '',
		defaultMemberPermissions: command.permissions,
		dmPermission: command.runInDM ?? true,
	};
	if (!APICommand) {
		await client.application!.commands.create(providedCommandData);
		logger.info(`Created Command ${command.name}`);
	} else {
		if (!APICommand.equals(providedCommandData, true)) {
			await APICommand.edit(providedCommandData);
			logger.debug(`Updated Command ${command.name}`);
		}
	}

	logger.debug(`Processed Command ${command.name}`);
	return;
}

async function syncCommands(client: Client) {
	// Global
	const { logger } = client;
	logger.debug(`Fetching Global Commands`);

	const localGlobalCommands = [...client.commands.filter((c) => !c.guildIds?.length && Boolean(c.commandRun)).keys()];

	const APIGlobalCommands = await (await client.application?.fetch())!.commands.fetch();

	const APIGlobalCommandsNames = APIGlobalCommands.map((c) => c.name);

	logger.debug(`Comparing Global Commands data to local data`);
	const toRemove = APIGlobalCommandsNames.filter((c) => !localGlobalCommands.includes(c));
	if (toRemove.length) {
		logger.debug(`Removing ${toRemove.length} Global Commands from API`);
	} else logger.debug(`No Global Commands found to remove, All synced!`);

	for (const command of toRemove) {
		logger.debug(`Deleted Global Command: ${command}`);
		APIGlobalCommands.find((cmd) => cmd.name === command)?.delete();
	}

	// Guild
	const guilds = [...client.guilds.cache.values()];

	for (const guild of guilds) {
		logger.debug(`Fetching Guild Commands for ${guild.name}`);

		const APIGuildCommands = await guild.commands.fetch();

		const localGuildCommands = [
			...client.commands.filter((c) => Boolean(c.guildIds?.includes(guild.id)) && Boolean(c.commandRun)).keys(),
		];

		const APIGuildCommandsNames = APIGuildCommands.map((c) => c.name);

		logger.debug(`Comparing Guild Commands data to local data`);
		const toRemove = APIGuildCommandsNames.filter((c) => !localGuildCommands.includes(c));
		if (toRemove.length) {
			logger.debug(`Removing ${toRemove.length} Guild Commands from API`);
		} else logger.debug(`No Commands found to remove from Guild "${guild.name}", All synced!`);

		for (const command of toRemove) {
			logger.debug(`Deleted Guild Command ${command} -> ${guild.name}`);
			APIGuildCommands.find((cmd) => cmd.name === command)?.delete();
		}
	}
}

interface RegistryOptions {
	/**
	 * Syncs commands with local commands
	 */
	sync?: boolean;
	/**
	 * Registers commands in detailed way
	 */
	register?: boolean;
	/**
	 * Uses Native [Routes](https://discordjs.guide/creating-your-bot/command-deployment.html#command-registration)
	 */
	shortcut?: boolean;
}
