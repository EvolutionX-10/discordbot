import { Command, Client } from '#lib/structures';
import { ApplicationCommandData, ApplicationCommandType } from 'discord.js';
import { readdirSync } from 'fs';

export async function initiateCommands(
	client: Client,
	register: boolean = false,
	sync: boolean = false
) {
	client.logger.info(`Syncing Commands...`);
	const now = Date.now();
	register && await registerCommands(client);
	sync && await syncCommands(client);
	const diff = Date.now() - now;
	client.logger.info(`Commands Synced in ${diff.toLocaleString()}ms`);
}

export async function handleRegistry(client: Client, reload: boolean = false) {
	const commandFolders = readdirSync(`${process.cwd()}\\dist\\commands`);
	for (const folder of commandFolders) {
		const commandsFiles = readdirSync(
			`${process.cwd()}\\dist\\commands\\${folder}`
		).filter((file) => file.endsWith('.js'));

		for (const file of commandsFiles) {
			const path = reload
				? `../commands/${folder}/${file}?update=${Date.now()}`
				: `../commands/${folder}/${file}`;
			const { command } = (await import(path)) as { command: Command };

			if (!command)
				throw new Error(
					`There is no exported Command Class in ${file}!\nPath: ${process.cwd()}\\dist\\commands\\${folder}\\${file}`
				);

			command.name = file.slice(0, -3);

			client.commands.set(command.name, command);
		}
	}
}

async function registerCommands(client: Client) {
	const commandsWithchatInputRun = client.commands
		.filter((c) => Boolean(c.commandRun))
		.values();
	for (const command of commandsWithchatInputRun) {
		await checkFromClient(client, command);
	}
}

async function checkFromClient(client: Client, command: Command) {
	const { logger } = client;
	// Guild Command Check
	if (command.guildIds?.length) {
		const now = Date.now();
		for (const guildId of command.guildIds) {
			const guild = await client.guilds.fetch(guildId).catch(() => null);

			if (!guild) throw new Error('Invalid Guild!');

			logger.debug(
				`Checking if ${command.name} is already registered -> ${guild.name}`
			);

			const APICommand = (await guild.commands.fetch()).find(
				(cmd) => cmd.name === command.name
			);

			const providedCommandData: ApplicationCommandData = {
				name: command.name,
				type: command.type as ApplicationCommandType,
				options: command.options,
				description: command.description ?? '',
				defaultMemberPermissions: command.permissions,
				dmPermission: command.runInDM,
			};

			if (!APICommand) {
				logger.debug(`${command.name} is not registered -> ${guild.name}`);
				logger.debug(`Registering ${command.name} -> ${guild.name}`);

				await guild.commands.create(providedCommandData);

				logger.info(`Created Command ${command.name} -> ${guild.name}`);
				continue;
			}

			logger.debug(
				`Checking differences in Command ${command.name} -> ${guild.name}`
			);
			if (!APICommand.equals(providedCommandData, true)) {
				logger.debug(
					`Found differences in Command ${command.name} -> ${guild.name}`
				);

				await APICommand.edit(providedCommandData);

				logger.debug(`Updated Command ${command.name} -> ${guild.name}`);
				continue;
			} else logger.debug(`No differences found in Command ${command.name} -> ${guild.name}`);
		}
		const diff = Date.now() - now;
		logger.debug(
			`Processed Command ${command.name} in ${diff.toLocaleString()}ms`
		);
		return;
	}

	// Global Command Check
	const now = Date.now();

	logger.debug(`Checking if ${command.name} is already registered`);

	const APICommand = (
		await (await client.application?.fetch())!.commands.fetch()
	).find((cmd) => cmd.name === command.name);

	const providedCommandData: ApplicationCommandData = {
		name: command.name,
		type: command.type as ApplicationCommandType,
		options: command.options,
		description: command.description ?? '',
	};
	if (!APICommand) {
		logger.debug(`${command.name} is not registered`);
		logger.debug(`Registering Command ${command.name}`);

		await client.application!.commands.create(providedCommandData);

		logger.info(`Created Command ${command.name}`);
	} else {
		logger.debug(`Checking differences in Command ${command.name}`);
		if (!APICommand.equals(providedCommandData, true)) {
			logger.debug(`Found differences in Command ${command.name}`);

			await APICommand.edit(providedCommandData);

			logger.debug(`Updated Command ${command.name}`);
		} else logger.debug(`No differences found in Command ${command.name}`);
	}

	const diff = Date.now() - now;
	logger.debug(
		`Processed Command ${command.name} in ${diff.toLocaleString()}ms`
	);
	return;
}

async function syncCommands(client: Client) {
	// Global
	const { logger } = client;
	logger.debug(`Fetching Global Commands`);

	const localGlobalCommands = [
		...client.commands
			.filter((c) => !c.guildIds?.length && Boolean(c.commandRun))
			.keys(),
	];

	const APIGlobalCommands =
		await (await client.application?.fetch())!.commands.fetch();

	const APIGlobalCommandsNames = APIGlobalCommands.map((c) => c.name);

	logger.debug(`Comparing Global Commands data to local data`);
	const toRemove = APIGlobalCommandsNames.filter(
		(c) => !localGlobalCommands.includes(c)
	);
	if (toRemove.length) {
		logger.debug(`Removing ${toRemove.length} Global Commands from API`);
	} else logger.debug(`No Global Commands found to remove, All synced!`);

	for (const command of toRemove) {
		await APIGlobalCommands.find((cmd) => cmd.name === command)?.delete();
		logger.debug(`Deleted Global Command: ${command}`);
	}

	// Guild
	const guilds = [...client.guilds.cache.values()];

	for (const guild of guilds) {
		logger.debug(`Fetching Guild Commands for ${guild.name}`);

		const APIGuildCommands = await guild.commands.fetch();

		const localGuildCommands = [
			...client.commands
				.filter(
					(c) =>
						Boolean(c.guildIds?.includes(guild.id)) && Boolean(c.commandRun)
				)
				.keys(),
		];

		const APIGuildCommandsNames = APIGuildCommands.map((c) => c.name);

		logger.debug(`Comparing Guild Commands data to local data`);
		const toRemove = APIGuildCommandsNames.filter(
			(c) => !localGuildCommands.includes(c)
		);
		if (toRemove.length) {
			logger.debug(`Removing ${toRemove.length} Guild Commands from API`);
		} else
			logger.debug(
				`No Commands found to remove from Guild "${guild.name}", All synced!`
			);

		for (const command of toRemove) {
			await APIGuildCommands.find((cmd) => cmd.name === command)?.delete();
			logger.debug(`Deleted Guild Command ${command} -> ${guild.name}`);
		}
	}
}
