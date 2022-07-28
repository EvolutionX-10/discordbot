import { Listener } from '#lib/structures';
import { initiateCommands } from '#core';

export const listener = new Listener({
	event: 'ready',
	once: true,
	async run(client) {
		await initiateCommands(client, true, true);
	},
});
