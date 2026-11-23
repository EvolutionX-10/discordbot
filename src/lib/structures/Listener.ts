import type { Awaitable, ClientEvents } from 'discord.js';
import { Client } from './Client';

/**
 * Typed Discord event listener discovered from `src/listeners/<category>/*.ts`.
 * The loader appends the starter client after the normal discord.js event arguments.
 * @typeParam E Discord event name used to infer handler arguments.
 * @example
 * ```ts
 * export default new Listener({
 *   event: 'guildCreate',
 *   run(guild, client) { client.logger.info(`Joined ${guild.name}`); },
 * });
 * ```
 */
export class Listener<E extends keyof ClientEvents = keyof ClientEvents> {
	private data: ListenerOptions<E>;
	/** Discord event to attach; enable any intents required by that event. */
	public event: keyof ClientEvents;
	/** Whether to detach after the first event; defaults to false. */
	public once: boolean;
	/** Event handler with the starter client appended as the last argument. */
	public run: (...args: EventArgs<E>) => Awaitable<void>;

	/** Stores listener configuration; the loader attaches the handler during login. */
	public constructor(data: ListenerOptions<E>) {
		this.data = data;
		this.event = data.event;
		this.once = data.once ?? false;
		this.run = data.run;
	}
	/** Uses the filename as a fallback without overriding an explicit name. */
	public set name(name: string) {
		this.data.name = this.data.name ?? name;
	}
	/** Gets the listener name; throws if neither configuration nor discovery supplied it. */
	public get name(): string {
		if (!this.data.name) throw new Error('Listener name is not set');
		return this.data.name;
	}
}

/** Event subscription options; name defaults to the discovered filename. */
interface ListenerOptions<T> {
	name?: string;
	event: T extends keyof ClientEvents ? T : keyof ClientEvents;
	/** Attach with client.once instead of client.on; defaults to false. */
	once?: boolean;
	/** Receives the event arguments, then the starter client. */
	run(...args: EventArgs<T>): Awaitable<void>;
}

type EventArgs<T> = T extends keyof ClientEvents ? [...args: ClientEvents[T], client: Client<true>] : unknown[];
