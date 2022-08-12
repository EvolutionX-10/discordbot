import type { Awaitable, ClientEvents, CommandInteraction, Message } from 'discord.js';
import { Command } from './Command.js';

export class Listener<E extends keyof Events = keyof Events> {
	private data: ListenerOptions<E>;
	public event: E extends keyof Events ? E : never;
	public once: boolean;
	public run: (
		...args: E extends keyof Events ? Events[E] : unknown[]
	) => Awaitable<void>;

	public constructor(data: ListenerOptions<E>) {
		this.data = data;
		this.event = data.event;
		this.once = data.once ?? false;
		this.run = data.run;
	}
	public set name(name: string) {
		this.data.name = this.data.name ?? name;
	}
	public get name(): string {
		if (!this.data.name) throw new Error('Listener name is not set');
		return this.data.name;
	}
}

interface ListenerOptions<T> {
	name?: string;
	event: T extends keyof Events ? T : never;
	once?: boolean;
	run(
		...args: T extends keyof Events ? Events[T] : unknown[]
	): Awaitable<void>;
}

export interface Events extends ClientEvents {
	messageCommandAccepted: [command: Command, message: Message];
	messageCommandFinish: [command: Command, message: Message];
	applicationCommandAccepted: [command: Command, interaction: CommandInteraction];
	applicationCommandFinish: [command: Command, interaction: CommandInteraction];
}