import { CommandInteraction, Message } from 'discord.js';
import { CooldownScope } from './Command.js';

export class Cooldown {
	public scope: CooldownScope;
	public time: number;
	public error: string;
	public limit: number;
	public constructor(options: CooldownOptions = {}) {
		this.scope = options.scope || CooldownScope.Global;
		this.time = options.time || 0;
		this.error = options.error || 'Slow down';
		this.limit = options.limit || 1;
	}

	public get remaining() {
		return this.time - Date.now();
	}

	public get expired() {
		return this.remaining <= 0;
	}

	public get remainingTime() {
		return `<t:${Math.floor(this.remaining / 1000)}:R>`;
	}

	public run(payload: Message | CommandInteraction) {
		setTimeout(() => {
			payload.reply(this.error);
		}, this.time);
	}
}

interface CooldownOptions {
	time?: number;
	scope?: CooldownScope;
	limit?: number;
	error?: string;
}

declare module 'discord.js' {
	interface User {
		onCooldown?: boolean;
	}
	interface Guild {
		onCooldown?: boolean;
	}
	interface GuildChannel {
		onCooldown?: boolean;
	}
}