import { Client, Listener, Events as CustomEvents } from '#lib/structures';
import { readdirSync } from 'fs';

export async function handleListener(client: Client, reload: boolean = false) {
	const listenerFolders = readdirSync(`${process.cwd()}\\dist\\listeners`);
	for (const folder of listenerFolders) {
		const listenerFiles = readdirSync(
			`${process.cwd()}\\dist\\listeners\\${folder}`
		).filter((file) => file.endsWith('.js'));

		for (const file of listenerFiles) {
			const path = reload
				? `../listeners/${folder}/${file}?update=${Date.now()}`
				: `../listeners/${folder}/${file}`;

			const { listener } = (await import(path)) as { listener: Listener };
			listener.name = file.slice(0, -3);
			client.listener.set(listener.name, listener);

			if (reload) return;

			if (listener.once) {
				client.once(listener.event, listener.run);
			} else {
				client.on(listener.event, listener.run);
			}
		}
	}
}

declare module 'discord.js' {
	interface Client {
		on<K extends keyof CustomEvents>(
			event: K,
			listener: (...args: CustomEvents[K]) => Awaitable<void>
		): this;
		once<K extends keyof CustomEvents>(
			event: K,
			listener: (...args: CustomEvents[K]) => Awaitable<void>
		): this;
		emit<K extends keyof CustomEvents>(
			event: K,
			...args: CustomEvents[K]
		): boolean;
	}
}
