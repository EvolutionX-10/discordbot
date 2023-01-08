import { Listener } from '#lib/structures';

export default new Listener({
	event: 'messageCreate',
	async run(message) {
		if (message.author?.bot || message?.webhookId) return;
		if (
			!message.client.prefixes.some((prefix) =>
				message.content.startsWith(prefix)
			)
		)
			return;

		const [commandWithPrefix, ...args] = message.content.split(/\s+/);

		const prefix = message.client.prefixes.find((prefix) =>
			message.content.startsWith(prefix)
		);

		const commandName = commandWithPrefix.slice(prefix?.length || 0);
		const command =
			message.client.commands.get(commandName) ||
			message.client.commands.find((cmd) => cmd.aliases!.includes(commandName));

		if (!command) return;

		if (!command.messageRun) return;
		if (
			command.ownerOnly &&
			!message.client.ownerIds.includes(message.author.id)
		)
			return;

		if (!(command.runInDM ?? true)) return;

		try {
			await command.messageRun(message, args);
		} catch (error) {
			message.client.logger.error(
				(error as Error).stack ?? (error as Error).message
			);
		}
	},
});
