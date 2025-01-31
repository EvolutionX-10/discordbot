import { CommandType } from '#lib/enums';
import { Command } from '#lib/structures';
import { MessageFlags } from 'discord.js';

export default new Command({
	type: CommandType.User,
	async commandRun(interaction) {
		return interaction.reply({ content: 'Ping!?', flags: MessageFlags.Ephemeral });
	},
});
