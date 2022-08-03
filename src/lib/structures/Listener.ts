import type { Awaitable, ClientEvents } from 'discord.js';

export class Listener<E extends keyof ClientEvents = keyof ClientEvents> {
	private data: ListenerOptions<E>;
	public event: keyof ClientEvents;
	public once: boolean;
	public run: (
		...args: E extends keyof ClientEvents ? ClientEvents[E] : unknown[]
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
	event: T extends keyof ClientEvents ? T : keyof ClientEvents;
	once?: boolean;
	run(
		...args: T extends keyof ClientEvents ? ClientEvents[T] : unknown[]
	): Awaitable<void>;
}
