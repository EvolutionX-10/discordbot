import { CommandType } from '#lib/enums';
import { Command } from '#lib/structures';

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
				ephemeral: true,
			});
		return interaction.user
			.send({ content: msg.content })
			.then(() => interaction.reply({ content: 'DM sent!', ephemeral: true }))
			.catch(() =>
				interaction.reply({
					content: 'DM failed to send! Please open your DMs',
					ephemeral: true,
				})
			);
	},
});
