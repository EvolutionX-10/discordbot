import { handleListener, handleRegistry, initiateCommands } from '#core';
import { LogLevel } from '#lib/enums';
import { Command, Listener, Logger } from '#lib/structures';
import { Client as DJSClient, Collection, GatewayIntentBits, Partials, ActivityType } from 'discord.js';
import { cyanBright, underline } from 'colorette';

export class Client<Ready extends boolean = true> extends DJSClient<Ready> {
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

		this.logger.setLevel(LogLevel.Debug);
		this.prefixes = ['q!', '!']; //! Set your preferable prefix
		this.ownerIds = ['697795666373640213']; //! Set your Discord User ID
		this.restDebug = false; //! Set this to true if you want to see REST logs
	}

	public prefixes: string[] = [];

	public ownerIds: string[] = [];

	public commands = new Collection<string, Command>();

	public listener = new Collection<string, Listener>();

	public logger: Logger = new Logger();

	public override async login(token?: string | undefined): Promise<string> {
		await Promise.all([handleRegistry(this as Client), handleListener(this as Client)]);

		const promiseString = await super.login(token);
		this.logger.info(`Logged in as ${cyanBright(underline(`${this.user?.tag}`))}`);

		await initiateCommands(this as Client, {
			register: false,
			sync: false,
			shortcut: true,
		});

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
