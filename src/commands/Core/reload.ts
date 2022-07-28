import { handleListener, handleRegistry, initiateCommands } from '#core';
import { Command, Client } from '#lib/structures';
import { ApplicationCommandType } from 'discord.js';

export const command = new Command({
	type: ApplicationCommandType.ChatInput,
	description: 'Reloads the bot',
	guildIds: '991194621763919971',
	ownerOnly: true,
	async commandRun(interaction) {
		await interaction.deferReply({ ephemeral: true });
		await reloadAll(interaction.client);
		return interaction.editReply({ content: 'Reloaded!' });
	},
	async messageRun(message) {
		await reloadAll(message.client);
		return message.channel.send('Reloaded!');
	},
});

async function reloadAll(client: Client, reload: boolean = true) {
	await handleRegistry(client, reload);
	await handleListener(client, reload);
	await initiateCommands(client, true, true);
}
