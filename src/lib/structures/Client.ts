import 'dotenv/config';
import { Client as DJSClient, GatewayIntentBits, Collection } from 'discord.js';
import { Command, Listener, Logger } from '#lib/structures';
import { handleListener, handleRegistry } from '#core';
import { LogLevel } from '#lib/enums';

export class Client<Ready extends boolean = boolean> extends DJSClient<Ready> {
	public constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
			],
		});

		this.logger.setLevel(LogLevel.Debug);
		this.prefixes = ['q!', '!'];
		this.ownerIds = ['697795666373640213'];
	}

	public prefixes: string[] = [];

	public ownerIds: string[] = [];

	public commands = new Collection<string, Command>();

	public listener = new Collection<string, Listener>();

	public logger: Logger = new Logger();

	public override async login(token?: string | undefined): Promise<string> {
		handleRegistry(this);
		handleListener(this);
		return super.login(token);
	}
}

declare module 'discord.js' {
	interface Client {
		ownerIds: string[];
		commands: Collection<string, Command>;
		listener: Collection<string, Listener>;
		logger: Logger;
		prefixes: string[];
	}
}
