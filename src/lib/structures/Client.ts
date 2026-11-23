import { handleListener, handleRegistry, initiateCommands } from '#core';
import { LogLevel } from '#lib/enums';
import { Command, Listener, Logger } from '#lib/structures';
import { Client as DJSClient, Collection, GatewayIntentBits, Partials, ActivityType } from 'discord.js';
import { cyanBright, underline } from 'colorette';

/**
 * Bot client with command/listener discovery, logging, and startup registration.
 * Customize intents, presence, prefixes, owners, and logging in the constructor.
 * Message commands and Prompt require Message Content enabled in the Developer Portal.
 */
export class Client<Ready extends boolean = true> extends DJSClient<Ready> {
	/** Creates the client with the starter's intents and sample configuration. */
	public constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.MessageContent,
			],
			partials: [Partials.Channel],
			presence: {
				status: 'dnd', // ! Set your bot's status (online, dnd, idle, invisible)
				activities: [
					{
						name: 'Template Stars go brrrr', // ! Set your bot's activity
						type: ActivityType.Watching,
					},
				],
			},
		});

		this.logger.setLevel(LogLevel.Info); //! Set the logger level
		this.prefixes = ['q!', '!']; //! Set your preferable prefix
		this.ownerIds = ['697795666373640213']; //! Set your Discord User ID
		this.restDebug = false; //! Set this to true if you want to see REST logs
	}

	/** Prefixes accepted by the message-command dispatcher; defaults to `q!` and `!`. */
	public prefixes: string[] = [];

	/** Discord user IDs allowed to run owner-only commands; replace the sample ID. */
	public ownerIds: string[] = [];

	/** Commands indexed by their explicit name or filename after discovery. */
	public commands = new Collection<string, Command>();

	/** Discovered listeners indexed by their explicit name or filename. */
	public listener = new Collection<string, Listener>();

	/** Shared logger, initially configured with the Info threshold. */
	public logger: Logger = new Logger();

	/**
	 * Loads commands/listeners, connects to Discord, then dispatches registry work.
	 * Run from the repository root so filesystem discovery can find `src`.
	 * The default shortcut bulk-replaces global and one guild's command lists;
	 * the registry currently does not await all REST requests before returning.
	 * @param token Bot token; defaults to discord.js's DISCORD_TOKEN environment lookup.
	 * @returns The login token returned by discord.js; never log this value.
	 * @throws If discovery, imports, or Discord login fail.
	 */
	public override async login(token?: string | undefined): Promise<string> {
		await Promise.all([handleRegistry(this as Client), handleListener(this as Client)]);

		const promiseString = await super.login(token);
		this.logger.info(`Logged in as ${cyanBright(underline(`${this.user?.tag}`))}`);

		await initiateCommands(this as Client, { register: false, sync: false, shortcut: true });

		return promiseString;
	}
}

declare module 'discord.js' {
	interface Client {
		ownerIds: string[];
		commands: Collection<string, Command>;
		listener: Collection<string, Listener>;
		logger: Logger;
		prefixes: string[];
		restDebug: boolean;
	}
}
