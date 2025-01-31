import { CommandType } from '#lib/enums';
import { Command } from '#lib/structures';
import { MessageFlags } from 'discord.js';

export default new Command({
	name: 'Save',
	type: CommandType.Message,
	description: 'DMs you the message',
	dmPermission: false,
	async commandRun(interaction) {
		const msg = interaction.options.getMessage('message');
		if (!msg) return;
		if (!msg.content)
			return interaction.reply({
				content: 'No message content found',
				flags: MessageFlags.Ephemeral,
			});
		return interaction.user
			.send({ content: msg.content })
			.then(() => interaction.reply({ content: 'DM sent!', flags: MessageFlags.Ephemeral }))
			.catch(() =>
				interaction.reply({
					content: 'DM failed to send! Please open your DMs',
					flags: MessageFlags.Ephemeral,
				})
			);
	},
});
