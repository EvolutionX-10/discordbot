import { Client, Listener } from '#lib/structures';
import { readdirSync } from 'fs';

export async function handleListener(client: Client) {
	client.restDebug &&
		client.rest.on('restDebug', (r) => client.logger.debug(r));
	const listenerFolders = readdirSync(`${process.cwd()}/dist/listeners`);
	for (const folder of listenerFolders) {
		const listenerFiles = readdirSync(
			`${process.cwd()}/dist/listeners/${folder}`
		).filter((file) => file.endsWith('.js'));

		for (const file of listenerFiles) {
			const path = `../listeners/${folder}/${file}`;

			const listener = (await import(path)).default as Listener;
			listener.name = file.slice(0, -3);
			client.listener.set(listener.name, listener);

			if (listener.once) {
				client.once(listener.event, (...args) => listener.run(...args, client));
			} else {
				client.on(listener.event, (...args) => listener.run(...args, client));
			}
		}
	}
}
