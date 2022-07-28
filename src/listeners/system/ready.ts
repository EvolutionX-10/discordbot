import { Listener } from '#lib/structures';

export const listener = new Listener({
	event: 'ready',
	once: true,
	async run(client) {
		client.logger.info(`Logged in as ${client.user.tag}`);
	},
});
